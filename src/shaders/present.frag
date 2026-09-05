#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uImage;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPan;
uniform float uEnergy;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float sdBox(vec2 p, vec2 b) {
  vec2 d = abs(p) - b;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float frameRing(vec2 uv, vec2 center, vec2 halfSize, float thick) {
  vec2 p = uv - center;
  float outer = sdBox(p, halfSize);
  float inner = sdBox(p, max(halfSize - vec2(thick), vec2(0.0)));
  return step(outer, 0.0) * (1.0 - step(inner, 0.0));
}

float insideBox(vec2 uv, vec2 center, vec2 halfSize) {
  vec2 d = abs(uv - center);
  return step(d.x, halfSize.x) * step(d.y, halfSize.y);
}

float pole(vec2 p, vec2 a, vec2 b, float w) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-4), 0.0, 1.0);
  return step(length(pa - ba * h), w);
}

vec2 glitchUv(vec2 uv, float t) {
  float kick = 0.9 - uEnergy * 0.12;
  float row = floor((uv.y + t * 0.01) * 36.0);
  float h = hash21(vec2(row, floor(t * 9.0)));
  if (h > kick) {
    uv.x += (h - 0.95) * (0.28 + uEnergy * 0.35);
  }
  vec2 block = floor(uv * vec2(22.0, 14.0));
  float b = hash21(block + floor(t * 2.8));
  if (b > 0.968 - uEnergy * 0.04) {
    uv += (vec2(hash21(block + 1.3), hash21(block + 4.1)) - 0.5) * (0.08 + uEnergy * 0.1);
  }
  if (mod(floor(uv.y * uResolution.y), 3.0) < 0.5 && hash21(vec2(floor(t * 5.0), 8.0)) > 0.55 - uEnergy * 0.2) {
    uv.x += 0.0035 + uEnergy * 0.006;
  }
  return uv;
}

void main() {
  vec2 uv = vUv;
  float t = uTime;
  float aspect = uResolution.x / max(uResolution.y, 1.0);

  vec2 gUv = glitchUv(uv - uPan * 0.04, t);
  float split = 0.0035 + 0.004 * step(0.92, hash21(vec2(floor(t * 6.0), 2.2))) + uEnergy * 0.01;
  vec3 col;
  col.r = texture(uImage, gUv + vec2(split, 0.0)).r;
  col.g = texture(uImage, gUv).g;
  col.b = texture(uImage, gUv - vec2(split, 0.0)).b;

  float scan = 0.78 + 0.22 * sin(uv.y * uResolution.y * 3.14159);
  col *= scan;

  float tear = hash21(vec2(floor(uv.y * 70.0), floor(t * 11.0)));
  if (tear > 0.97 - uEnergy * 0.06) {
    col = vec3(col.g, col.b, col.r) * vec3(1.0, 0.2, 0.85);
  }

  vec2 cA = vec2(0.5, 0.5) + uPan * 0.018;
  vec2 cB = vec2(0.528, 0.462) + uPan * 0.055;
  vec2 cC = vec2(0.38, 0.58) + uPan * 0.09;
  vec2 halfA = vec2(0.448, 0.418);
  vec2 halfB = vec2(0.372, 0.328);
  float thick = 0.02;

  float windowA = insideBox(uv, cA, halfA - vec2(thick));
  float windowB = insideBox(uv, cB, halfB - vec2(thick * 0.75));

  vec2 gUvB = glitchUv(uv + vec2(0.03, -0.04) - uPan * 0.08, t + 2.4);
  vec3 colB;
  colB.r = texture(uImage, gUvB + vec2(split * 1.6, 0.0)).r;
  colB.g = texture(uImage, gUvB).g;
  colB.b = texture(uImage, gUvB - vec2(split * 1.6, 0.0)).b;

  vec3 framed = mix(colB * vec3(1.15, 0.32, 0.92), col, windowA);
  float window = max(windowA, windowB);
  framed *= window;

  float ringA = frameRing(uv, cA, halfA, thick);
  float ringB = frameRing(uv, cB, halfB, thick * 0.85);
  float ringC = frameRing(uv, cC, vec2(0.16, 0.14), 0.011);

  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 panP = uPan * vec2(aspect, 1.0);
  float poles = 0.0;
  poles += pole(p, vec2(-0.95, -0.72) + panP * 0.16, vec2(0.82, 0.88) + panP * 0.05, 0.007);
  poles += pole(p, vec2(-0.6, 0.9) + panP * 0.22, vec2(0.92, -0.55) + panP * 0.08, 0.0055);
  poles += pole(p, vec2(0.05, -0.92) + panP * 0.12, vec2(-0.2, 0.95) + panP * 0.28, 0.0045);

  vec3 outCol = mix(vec3(0.0), framed, window);
  outCol = mix(outCol, vec3(0.0), clamp(ringA + ringB + ringC, 0.0, 1.0));
  outCol = mix(outCol, vec3(0.0), clamp(poles, 0.0, 1.0));

  float edgeLite = ringA * step(0.96, hash21(uv * 80.0 + t));
  outCol += vec3(0.0, 0.85, 1.0) * edgeLite * 0.35;

  float grain = hash21(uv * uResolution + fract(t) * 180.0) - 0.5;
  outCol += grain * 0.045;

  outCol = max(outCol, vec3(0.0));
  outCol = pow(outCol, vec3(0.88));

  fragColor = vec4(outCol, 1.0);
}
