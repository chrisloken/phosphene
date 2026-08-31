#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uImage;
uniform vec2 uResolution;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= uResolution.x / max(uResolution.y, 1.0);

  float aberr = 0.0018 * length(p);
  vec3 col;
  col.r = texture(uImage, uv + vec2(aberr, 0.0)).r;
  col.g = texture(uImage, uv).g;
  col.b = texture(uImage, uv - vec2(aberr, 0.0)).b;

  float vig = smoothstep(1.35, 0.28, length(p));
  col *= mix(0.22, 1.0, vig);

  float grain = hash(uv * uResolution + fract(uTime) * 160.0) - 0.5;
  col += grain * 0.028;

  col = col / (col + vec3(1.0));
  col = pow(max(col, vec3(0.0)), vec3(0.92));

  fragColor = vec4(col, 1.0);
}
