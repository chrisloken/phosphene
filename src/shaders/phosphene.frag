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
uniform float uMirror;
uniform vec2 uPan;
uniform float uEnergy;

const vec3 MAG = vec3(1.0, 0.04, 0.72);
const vec3 CYN = vec3(0.0, 0.92, 1.0);
const vec3 ORG = vec3(1.0, 0.34, 0.06);
const vec3 WHT = vec3(0.94, 0.96, 1.0);
const vec3 INK = vec3(0.0);

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
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.11 + vec2(1.7, 9.2);
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
  st.x = mix(st.x, 1.0 - st.x, uMirror);
  return st;
}

vec3 sampleCamera(vec2 uv) {
  if (uHasCamera < 0.5) {
    return INK;
  }
  vec2 st = coverUv(uv, uCameraSize, uResolution);
  if (st.x < 0.0 || st.x > 1.0 || st.y < 0.0 || st.y > 1.0) {
    return INK;
  }
  return texture(uCamera, st).rgb;
}

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

vec2 shearUv(vec2 uv, float t, float hold) {
  float jitter = hold + uEnergy * 0.85;
  float row = floor(uv.y * (28.0 + 40.0 * jitter));
  float h = hash21(vec2(row, floor(t * 7.0)));
  if (h > 0.86 - jitter * 0.1) {
    uv.x += (h - 0.93) * (0.18 + jitter * 0.22);
  }
  vec2 block = floor(uv * vec2(16.0, 10.0));
  float b = hash21(block + floor(t * 3.0));
  if (b > 0.955 - jitter * 0.04) {
    uv.x = fract(uv.x + 0.12 + 0.2 * hash21(block + 3.2));
  }
  return uv;
}

vec3 iridescent(float n) {
  return mix(MAG, mix(CYN, mix(ORG, WHT, step(0.75, n)), step(0.45, n)), step(0.22, n));
}

vec3 armature(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  p -= uPan * 0.12;
  float L = luma(cam);
  float r = length(p);
  float ring = abs(r - mix(0.18, 0.28, hold));
  float halo = smoothstep(0.028, 0.0, ring);
  float n = fbm(p * 3.2 + t * 0.15);
  vec3 film = iridescent(n + L * 0.35);
  vec3 col = INK;
  col += film * pow(n, 2.2) * (0.45 + L * 0.7);
  col += CYN * halo * (0.85 + 0.4 * sin(t * 2.2));
  col += MAG * halo * 0.25;
  col += cam * vec3(0.55, 0.2, 0.85) * uHasCamera * 0.55;
  float grid = max(
    step(0.97, fract(p.x * 4.0)),
    step(0.97, fract(p.y * 4.0))
  );
  col += WHT * grid * 0.12;
  col *= 0.35 + 0.65 * smoothstep(0.95, 0.2, r);
  return col;
}

vec3 cubic(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  p -= uPan * 0.18;
  float L = luma(cam);
  float scale = mix(3.4, 5.6, hold);
  vec2 q = p * scale;
  q += 0.15 * vec2(sin(t * 0.3), cos(t * 0.27));
  vec2 id = floor(q);
  vec2 f = fract(q) - 0.5;
  float box = max(abs(f.x), abs(f.y));
  float wire = smoothstep(0.04, 0.0, abs(box - 0.42));
  float dash = step(0.45, fract(atan(f.y, f.x) * 3.0 + t));
  float n = hash21(id + floor(t * 0.5));
  vec3 fill = mix(INK, cam * 1.2, uHasCamera);
  fill = mix(fill, iridescent(n), 0.35 * n);
  vec3 col = mix(INK, fill, step(box, 0.42) * (0.18 + L * 0.45 + n * 0.2));
  col += mix(WHT, CYN, n) * wire * (0.7 + dash * 0.5);
  col += MAG * step(0.985, hash21(id + 9.0 + floor(t * 4.0))) * step(box, 0.42);
  return col;
}

vec3 transmission(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float L = luma(cam);
  float y = uv.y + t * (0.04 + hold * 0.04);
  float band = fract(y * mix(18.0, 32.0, hold));
  float scan = smoothstep(0.18, 0.0, abs(band - 0.5));
  float punch = step(0.82, hash21(vec2(floor(uv.x * 42.0), floor(uv.y * 22.0))));
  float pulse = 0.5 + 0.5 * sin(uv.y * 40.0 - t * 8.0);
  vec3 col = INK;
  col += CYN * scan * (0.22 + L * 0.5);
  col += MAG * punch * 0.55;
  col += ORG * step(0.97, hash21(vec2(floor(t * 2.0), floor(uv.y * 40.0)))) * 0.4;
  float r = length(p);
  float funnel = 1.0 / (r * 4.0 + 0.2);
  col += WHT * pulse * 0.04 * funnel;
  col += cam * vec3(0.2, 0.7, 1.0) * uHasCamera * 0.4;
  float drop = step(0.93, hash21(vec2(floor(t * 5.0), 4.0)));
  col *= 1.0 - drop * 0.85 * step(0.4, fract(uv.y * 3.0 + t));
  return col;
}

vec3 staticField(vec2 uv, vec3 cam, vec3 prev, float t, float hold) {
  vec2 suv = shearUv(uv, t, hold);
  float n = hash21(suv * uResolution + floor(t * 24.0));
  float n2 = hash21(suv * 90.0 + t);
  vec3 snow = vec3(n);
  vec3 psy = vec3(n, n2, hash21(suv * 40.0 - t));
  vec3 col = mix(snow, psy, 0.65);
  col = mix(col, vec3(1.0) - cam, uHasCamera * 0.55);
  col *= mix(vec3(1.0), MAG, step(0.7, suv.x) * 0.35);
  col *= mix(vec3(1.0), CYN, step(suv.x, 0.3) * 0.35);
  float persist = mix(0.72, 0.9, hold);
  col = mix(col, prev, persist);
  col += (col - prev) * 0.22;
  return col * (0.85 + 0.3 * luma(cam));
}

vec3 undone(vec2 uv, vec3 cam, float t, float hold) {
  vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
  float ang = atan(p.y, p.x);
  float r = length(p);
  float L = luma(cam);
  float shards = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float a = ang * (3.0 + fi) + t * (0.2 + fi * 0.05);
    float zig = abs(sin(a * 4.0 + sin(a * 2.0)));
    shards += smoothstep(0.04, 0.0, abs(r - (0.12 + fi * 0.12 + hold * 0.05)) - 0.02 * zig);
  }
  float mesh = max(
    step(0.96, fract((p.x + p.y) * 7.0 + t * 0.2)),
    step(0.96, fract((p.x - p.y) * 7.0 - t * 0.15))
  );
  vec3 col = INK;
  col += mix(MAG, ORG, 0.5 + 0.5 * sin(ang * 2.0)) * shards * (0.7 + hold * 0.5);
  col += CYN * mesh * 0.45;
  col += cam * vec3(0.9, 0.3, 1.0) * uHasCamera * (0.2 + 0.5 * shards);
  col += WHT * pow(hash21(floor(p * 40.0 + t * 6.0)), 16.0) * shards * 2.0;
  return col;
}

void main() {
  vec2 uv = shearUv(vUv + uPan * 0.03, uTime, uHold * 0.65);
  vec3 cam = sampleCamera(vUv - uPan * 0.05);
  vec3 prev = texture(uPrev, vUv).rgb;
  float t = uTime;
  float hold = clamp(uHold, 0.0, 1.0);
  float mode = uMode;

  vec3 col;
  if (mode < 0.5) {
    col = armature(uv, cam, t, hold);
  } else if (mode < 1.5) {
    col = cubic(uv, cam, t, hold);
  } else if (mode < 2.5) {
    col = transmission(uv, cam, t, hold);
  } else if (mode < 3.5) {
    col = staticField(uv, cam, prev, t, hold);
  } else {
    col = undone(uv, cam, t, hold);
  }

  bool isStatic = mode > 2.5 && mode < 3.5;
  if (!isStatic) {
    col = mix(col, prev, mix(0.28, 0.55, hold));
  }

  col *= mix(0.9, 1.2, uIntensity);
  fragColor = vec4(max(col, vec3(0.0)), 1.0);
}
