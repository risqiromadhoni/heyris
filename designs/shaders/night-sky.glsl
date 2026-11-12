precision highp float;

/** @resolution */
uniform vec2 u_resolution;

/** @time */
uniform float u_time;

/** @mouse */
uniform vec2 u_mouse;

/**
 * @label Moonlight
 * @color
 * @default #D6E0FF
 */
uniform vec3 u_moon;

/**
 * @label Aurora A
 * @color
 * @default #6F7CFF
 */
uniform vec3 u_aurora_a;

/**
 * @label Aurora B
 * @color
 * @default #4FC8B4
 */
uniform vec3 u_aurora_b;

/**
 * @label Starlight
 * @color
 * @default #F3EDDC
 */
uniform vec3 u_star;

/**
 * @label Grain color
 * @color
 * @default #E8E5DF
 */
uniform vec3 u_ink;

/**
 * @label Haze strength
 * @range 0, 1
 * @default 1
 */
uniform float u_haze;

/**
 * @label Starlight
 * @range 0, 1
 * @default 1
 */
uniform float u_stars;

/**
 * @label Grain
 * @range 0, 1
 * @default 1
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

/**
 * @label Quiet zone width (px)
 * @range 0, 1440
 * @default 720
 */
uniform float u_quiet;

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

float stars(vec2 q, float cell, float tm) {
  vec2 id = floor(q / cell);
  vec2 f = fract(q / cell);
  float acc = 0.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 o = vec2(float(i), float(j));
      vec2 cid = id + o;
      float h = hash(cid);
      float present = step(h, 0.26);
      vec2 d = (o + vec2(hash(cid + 3.7), hash(cid + 9.1)) - f) * cell;
      float r = length(d);
      float bright = 0.35 + 0.65 * (h / 0.26);
      float tw = 0.7 + 0.3 * sin(tm * (0.5 + h * 4.0) + h * 60.0);
      float core = 1.0 - smoothstep(0.3, 1.4, r);
      float glow = 0.2 * exp(-(r * r) / 18.0);
      acc += present * bright * tw * (core + glow);
    }
  }
  return acc;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / u_resolution;
  float asp = u_resolution.x / u_resolution.y;
  float t = u_time * u_speed;
  vec2 p = vec2(uv.x * asp, uv.y);

  float n1 = fbm(p * 1.4 + vec2(t * 0.30, -t * 0.18));
  float n2 = fbm(p * 1.9 + vec2(n1 * 1.5, n1 * 1.1) + vec2(-t * 0.24, t * 0.14) + 5.1);

  float open = smoothstep(u_quiet - 90.0, u_quiet, px.x);
  float lift = (1.0 + 0.6 * open) * u_haze;

  vec2 moonAt = vec2((0.72 + 0.04 * sin(t * 0.8)) * asp, 0.90 + 0.03 * cos(t * 0.6));
  float dm = distance(p, moonAt);
  float pool = exp(-(dm * dm) / (2.0 * 0.45 * 0.45));
  float moonA = pool * (0.55 + 0.7 * smoothstep(0.30, 0.75, n1)) * 0.07 * lift;

  float y1 = uv.y - (0.66 + 0.09 * sin(p.x * 2.4 + t * 0.9 + n2 * 2.5));
  float y2 = uv.y - (0.42 + 0.08 * sin(p.x * 1.8 - t * 0.7 + n1 * 2.2 + 2.0));
  float rays = 0.75 + 0.25 * sin(p.x * 22.0 + n1 * 7.0 + t * 0.5);
  float auA = exp(-(y1 * y1) / (2.0 * 0.10 * 0.10)) * (0.3 + 0.7 * smoothstep(0.35, 0.80, n2)) * rays * 0.08 * lift;
  float auB = exp(-(y2 * y2) / (2.0 * 0.08 * 0.08)) * (0.3 + 0.7 * smoothstep(0.30, 0.75, n1)) * rays * 0.07 * lift;

  vec3 hazeC = u_moon * moonA + u_aurora_a * auA + u_aurora_b * auB;
  float hazeA = moonA + auA + auB;
  float cap = min(1.0, (0.10 + 0.06 * open) / max(hazeA, 0.0001));
  vec4 acc = vec4(hazeC * cap, hazeA * cap);

  float live = step(0.5, u_mouse.x + u_mouse.y);
  float dc = distance(px, u_mouse);
  float halo = exp(-(dc * dc) / (2.0 * 200.0 * 200.0)) * live * 0.08 * u_cursor;
  acc = vec4(u_moon * halo, halo) + acc * (1.0 - halo);

  float sa = clamp(stars(px - vec2(-20.0, -6.0) * t, 54.0, t * 6.0), 0.0, 1.0) * 0.6 * u_stars * open;
  acc = vec4(u_star * sa, sa) + acc * (1.0 - sa);

  float g = hash(px + 17.0);
  float ga = (g * 0.02 + smoothstep(0.985, 1.0, g) * 0.022) * u_grain;
  acc = vec4(u_ink * ga, ga) + acc * (1.0 - ga);

  gl_FragColor = acc;
}
