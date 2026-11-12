precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/**
 * @label Warm light
 * @color
 * @default #FFD9A0
 */
uniform vec3 u_warm;

/**
 * @label Cool light
 * @color
 * @default #C4D8FF
 */
uniform vec3 u_cool;

/**
 * @label Grain color
 * @color
 * @default #282828
 */
uniform vec3 u_ink;

/**
 * @label Haze strength
 * @range 0, 1
 * @default 0.5
 */
uniform float u_haze;

/**
 * @label Grain
 * @range 0, 1
 * @default 0.5
 */
uniform float u_grain;

/**
 * @label Cursor glow
 * @range 0, 1
 * @default 0.35
 */
uniform float u_cursor;

/**
 * @label Speed
 * @range 0, 2
 * @default 0.25
 */
uniform float u_speed;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / u_resolution;
  float asp = u_resolution.x / u_resolution.y;
  float t = u_time * u_speed;
  vec2 p = vec2(uv.x * asp, uv.y);

  float n1 = fbm(p * 1.4 + vec2(t * 0.30, -t * 0.18));
  float n2 = fbm(p * 1.9 + vec2(n1 * 1.5, n1 * 1.1) + vec2(-t * 0.24, t * 0.14) + 5.1);

  vec2 sun = vec2((0.80 + 0.05 * sin(t * 0.8)) * asp, 0.92 + 0.04 * cos(t * 0.6));
  float ds = distance(p, sun);
  float pool = exp(-(ds * ds) / (2.0 * 0.5 * 0.5));

  vec2 shade = vec2((0.12 + 0.04 * cos(t * 0.7)) * asp, 0.06 + 0.04 * sin(t * 0.5));
  float dc = distance(p, shade);
  float cool = exp(-(dc * dc) / (2.0 * 0.45 * 0.45));

  float warmA = clamp(pool * (0.55 + 0.9 * smoothstep(0.30, 0.75, n1)), 0.0, 1.0) * 0.34 * u_haze;
  float coolA = clamp(cool * (0.45 + 0.9 * smoothstep(0.35, 0.80, n2)), 0.0, 1.0) * 0.26 * u_haze;

  float live = step(0.5, u_mouse.x + u_mouse.y);
  float dm = distance(px, u_mouse);
  float halo = exp(-(dm * dm) / (2.0 * 200.0 * 200.0)) * live * 0.2 * u_cursor;

  float g = hash(px + 17.0);
  float grainA = (g * 0.04 + smoothstep(0.985, 1.0, g) * 0.05) * u_grain;

  float aw = warmA + halo;
  float ac = coolA;
  float ag = grainA;

  vec3 premul = u_warm * aw + u_cool * ac * (1.0 - aw) + u_ink * ag * (1.0 - aw - ac);
  float a = clamp(aw + ac * (1.0 - aw) + ag * (1.0 - aw - ac), 0.0, 1.0);
  gl_FragColor = vec4(premul, a);
}
