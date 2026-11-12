precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/**
 * @label Sunlight
 * @color
 * @default #FFE9B8
 */
uniform vec3 u_light;

/**
 * @label Ray strength
 * @range 0, 1
 * @default 0.5
 */
uniform float u_rays;

/**
 * @label Dust
 * @range 0, 1
 * @default 0.6
 */
uniform float u_dust;

/**
 * @label Speed
 * @range 0, 2
 * @default 0.5
 */
uniform float u_speed;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float motes(vec2 px, float cell, float t, float seed) {
  vec2 q = px;
  q.y -= t * (10.0 + seed * 5.0);
  vec2 id = floor(q / cell);
  vec2 f = fract(q / cell);
  float h = hash(id + seed);
  float h2 = hash(id + seed + 3.7);
  float h3 = hash(id + seed + 9.1);
  vec2 c = vec2(0.2 + 0.6 * h2 + 0.12 * sin(t * (0.6 + h3) + h * 40.0), 0.2 + 0.6 * h3);
  float r = (0.9 + 1.6 * h2) / cell;
  float d = length(f - c);
  float m = 1.0 - smoothstep(r * 0.35, r, d);
  float twinkle = 0.45 + 0.55 * sin(t * (1.2 + 2.0 * h3) + h * 30.0);
  return m * twinkle * step(h, 0.32);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / u_resolution;
  float asp = u_resolution.x / u_resolution.y;
  float t = u_time * u_speed;

  vec2 src = vec2(-0.12 * asp, 1.08);
  vec2 v = vec2(uv.x * asp, uv.y) - src;
  float len = length(v);
  float ang = atan(v.y, v.x);

  float bands = 0.5 + 0.5 * sin(ang * 13.0 + t * 0.7 + 0.8 * sin(ang * 5.0 - t * 0.9));
  bands = pow(bands, 3.0);
  float reach = exp(-len * 1.05);
  float bloom = exp(-len * len * 1.6);
  float rayA = (bands * reach * 0.22 + bloom * 0.18) * u_rays;

  float dustA = (motes(px, 34.0, t, 0.0) * 0.75 + motes(px, 58.0, t, 1.0) * 0.55) * u_dust * (0.35 + 0.65 * reach + 0.3 * uv.y);

  float a = clamp(rayA + dustA, 0.0, 0.85);
  gl_FragColor = vec4(u_light * a, a);
}
