#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uCamera;
uniform sampler2D uPrev;
uniform vec2 uResolution;
uniform vec2 uCameraSize;
uniform float uTime;
uniform float uMode;
uniform float uIntensity;
uniform float uHold;
uniform float uHasCamera;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.07 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

vec2 coverUv(vec2 uv, vec2 content, vec2 frame) {
  float ca = content.x / max(content.y, 1.0);
  float ra = frame.x / max(frame.y, 1.0);
  vec2 st = uv;
  if (ca > ra) {
    float s = ra / ca;
    st.x = (uv.x - 0.5) / s + 0.5;
  } else {
    float s = ca / ra;
    st.y = (uv.y - 0.5) / s + 0.5;
  }
  st.x = 1.0 - st.x;
  return st;
}

vec3 sampleCamera(vec2 uv) {
  if (uHasCamera < 0.5) {
    return vec3(0.0);
  }
  vec2 st = coverUv(uv, uCameraSize, uResolution);
  if (st.x < 0.0 || st.x > 1.0 || st.y < 0.0 || st.y > 1.0) {
    return vec3(0.0);
  }
  return texture(uCamera, st).rgb;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

vec2 hexDist(vec2 uv) {
  uv = abs(uv);
  float c = dot(uv, normalize(vec2(1.0, 1.732)));
  c = max(c, uv.x);
  return vec2(c, atan(uv.y, uv.x));
}

vec3 pressure(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float r = length(p);
  float a = atan(p.y, p.x);
  float L = luma(cam);

  vec3 col = vec3(0.012, 0.01, 0.02);

  float rings = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float rad = fract(t * (0.04 + fi * 0.011) + L * 0.35 + hold * 0.15);
    rad = mix(0.08, 0.95, rad);
    float w = 0.018 + hold * 0.03 + fi * 0.004;
    rings += smoothstep(w, 0.0, abs(r - rad)) * (1.0 - rad);
  }

  vec3 gold = vec3(0.95, 0.78, 0.48);
  vec3 mag = vec3(0.91, 0.42, 0.62);
  vec3 vio = vec3(0.38, 0.22, 0.72);
  col += rings * mix(gold, mag, 0.5 + 0.5 * sin(a * 3.0 + t)) * (0.55 + hold);

  for (int i = 0; i < 14; i++) {
    float fi = float(i);
    vec2 seed = vec2(fi * 17.1, fi * 9.3);
    float ang = hash21(seed) * 6.28318 + t * (0.07 + hash21(seed + 2.0) * 0.12);
    float rad = 0.08 + hash21(seed + 4.0) * 0.42;
    rad *= mix(1.0, 0.55, hold);
    vec2 pos = vec2(cos(ang), sin(ang)) * rad;
    pos += 0.04 * vec2(noise(vec2(t * 0.2, fi)), noise(vec2(fi, t * 0.2)));
    float bloom = 0.11 + hash21(seed + 8.0) * 0.1 + L * 0.08;
    float d = length(p - pos);
    float blob = exp(- (d * d) / (bloom * bloom));
    vec3 hue = mix(gold, mix(mag, vio, hash21(seed + 3.0)), hash21(seed + 1.0));
    float pulse = 0.55 + 0.45 * sin(t * (0.8 + hash21(seed) * 1.4) + fi);
    col += hue * blob * pulse * (0.45 + L * 0.7 + hold * 0.5);
  }

  float veil = exp(-r * 1.6);
  col += vec3(0.07, 0.03, 0.06) * veil * (0.4 + L);
  col += cam * 0.07 * uHasCamera;
  return col;
}

vec3 lattice(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float L = luma(cam);
  float scale = mix(7.0, 11.0, hold) + L * 3.0;
  vec2 q = p * scale;
  q += 0.35 * vec2(fbm(p * 2.0 + t * 0.08), fbm(p * 2.0 - t * 0.07));

  vec2 r = q;
  r.x *= 1.1547;
  vec2 g = vec2(r.x + r.y * 0.5, r.y * 0.866);
  vec2 id = floor(g);
  vec2 f = fract(g) - 0.5;
  float d = hexDist(f).x;
  float cell = smoothstep(0.46, 0.40, d);
  float web = smoothstep(0.08, 0.0, abs(d - 0.42));

  float n = fbm(id * 0.4 + t * 0.12);
  vec3 amber = vec3(0.92, 0.72, 0.38);
  vec3 cyan = vec3(0.45, 0.82, 0.86);
  vec3 ink = vec3(0.03, 0.04, 0.06);
  vec3 col = mix(ink, mix(amber, cyan, n), cell * (0.15 + n * 0.55 + L * 0.35));
  col += web * mix(amber, cyan, 0.4 + 0.4 * sin(t + L * 6.0)) * (0.35 + hold * 0.4);
  col += cam * vec3(0.12, 0.08, 0.06) * uHasCamera;
  col += vec3(0.04, 0.02, 0.05) * exp(-length(p) * 1.8);
  return col;
}

vec3 spiral(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float L = luma(cam);
  float r = length(p) + 1e-4;
  float a = atan(p.y, p.x);
  float logR = log(r * 4.2 + 0.08);
  float arms = 5.0 + hold * 3.0;
  float tunnel = fract(logR * 2.4 - a / 6.28318 * arms + t * (0.08 + L * 0.12));
  float ridge = smoothstep(0.22, 0.0, abs(tunnel - 0.5));
  float funnel = 1.0 / (r * 3.4 + 0.18);

  vec3 deep = vec3(0.09, 0.02, 0.08);
  vec3 hot = vec3(0.95, 0.35, 0.28);
  vec3 violet = vec3(0.42, 0.2, 0.72);
  vec3 col = deep * funnel;
  col += mix(hot, violet, tunnel) * ridge * (0.45 + hold * 0.5) * funnel;
  float spokes = pow(abs(sin(a * arms * 0.5 + logR * 4.0 - t)), 12.0);
  col += vec3(0.95, 0.82, 0.55) * spokes * 0.12 * funnel;
  col += cam * 0.1 * uHasCamera * (1.0 - smoothstep(0.0, 0.45, r));
  col *= 0.55 + 0.45 * smoothstep(1.2, 0.15, r);
  return col;
}

vec3 afterimage(vec2 uv, vec3 cam, vec3 prev, float t, float hold) {
  vec3 inv = vec3(1.0) - cam;
  inv = mix(inv, cam * vec3(0.2, 1.1, 1.3), 0.25);
  float L = luma(cam);
  float solar = smoothstep(0.15, 0.75, L);
  vec3 burn = mix(inv * vec3(0.55, 0.9, 1.15), vec3(L) * vec3(1.1, 0.45, 0.25), solar);
  if (uHasCamera < 0.5) {
    float n = fbm(uv * 3.0 + t * 0.05);
    burn = vec3(0.12, 0.05, 0.08) + vec3(0.55, 0.22, 0.18) * n * n;
  }
  float persist = mix(0.88, 0.96, hold);
  vec3 col = mix(burn, prev, persist);
  col += (burn - prev) * 0.18;
  float r = length((uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0));
  col *= 0.72 + 0.28 * exp(-r * 1.4);
  return col;
}

vec3 aura(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float r = length(p);
  float a = atan(p.y, p.x);
  float L = luma(cam);

  float wave = fract(t * 0.035 + hold * 0.02);
  float radius = mix(0.08, 0.92, wave);
  float zig = sin(a * 22.0 + sin(a * 5.0 + t * 0.7) * 2.0);
  zig += 0.45 * sin(a * 41.0 - t * 1.3);
  float band = abs(r - radius) - 0.018 * zig - L * 0.02;
  float fort = smoothstep(0.055, 0.0, band);

  vec3 prism = vec3(
    0.55 + 0.45 * sin(a * 3.0 + t),
    0.45 + 0.45 * sin(a * 3.0 + 2.1),
    0.55 + 0.45 * sin(a * 3.0 + 4.2)
  );
  vec3 gold = vec3(1.0, 0.86, 0.45);

  float scotoma = smoothstep(radius * 0.92, radius * 0.15, r);
  vec3 dark = vec3(0.015, 0.012, 0.02);
  vec3 peri = cam * vec3(0.35, 0.3, 0.4) * uHasCamera;
  peri += vec3(0.04, 0.05, 0.09) * fbm(uv * 4.0 + t * 0.03);

  vec3 col = mix(peri, dark, scotoma);
  col += fort * mix(gold, prism, 0.55) * (0.85 + hold * 0.5);
  float spark = pow(hash21(floor(vec2(a * 28.0, r * 40.0 + t * 8.0))), 14.0);
  col += spark * gold * fort * 2.2;
  return col;
}

void main() {
  vec2 uv = vUv;
  vec3 cam = sampleCamera(uv);
  vec3 prev = texture(uPrev, uv).rgb;
  float t = uTime;
  float hold = clamp(uHold, 0.0, 1.0);
  float mode = uMode;

  vec3 col;
  if (mode < 0.5) {
    col = pressure(uv, cam, t, hold);
  } else if (mode < 1.5) {
    col = lattice(uv, cam, t, hold);
  } else if (mode < 2.5) {
    col = spiral(uv, cam, t, hold);
  } else if (mode < 3.5) {
    col = afterimage(uv, cam, prev, t, hold);
  } else {
    col = aura(uv, cam, t, hold);
  }

  bool after = mode > 2.5 && mode < 3.5;
  if (!after) {
    col = mix(col, prev, mix(0.78, 0.9, hold) * 0.72);
  }

  col *= mix(0.85, 1.15, uIntensity);
  fragColor = vec4(max(col, vec3(0.0)), 1.0);
}
