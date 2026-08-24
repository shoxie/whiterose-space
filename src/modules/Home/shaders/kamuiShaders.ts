// ─────────────────────────────────────────────────────────────────────────────
// Ready-to-run GLSL shaders — Kamui Vortex
// Vertex: fullscreen quad (clip-space), Fragment: polar swirl + chromatic rim
// Uniforms: uCenter 0..1 (bottom-left), uTime, uIntensity 0..1, uRadius 0..1
// Math: offset = swirl(UV, distance, intensity, speed)
//        angle = intensity * 2π * decay * 1.42  where decay = pow(1-smoothstep(0,radius,dist),2.2)
//        suv   = center + rot(angle) * (uv-center) * (1 - decay*intensity*0.42)
// Black-hole: smoothstep core, event-horizon ring, dark particle absorption not in shader
// Usage with Three.js:
//   <planeGeometry args={[2,2]} />
//   <shaderMaterial vertexShader={kamuiVert} fragmentShader={kamuiFrag} uniforms={...} />
// Also works as Raw WebGL program or HTML5 Canvas WebGL context.
// ─────────────────────────────────────────────────────────────────────────────

export const kamuiVert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export const kamuiFrag = `
precision highp float;
varying vec2 vUv;
uniform vec2 uCenter;
uniform float uTime;
uniform float uIntensity;
uniform float uRadius;
uniform vec2 uResolution;

vec2 swirlUv(vec2 uv, vec2 center, float radius, float intensity, float time){
  vec2 d = uv - center;
  float dist = length(d);
  float pct = 1.0 - smoothstep(0.0, radius, dist);
  float decay = pow(pct, 2.2);
  float angle = intensity * 6.2831853 * decay * 1.42 + time * decay * 1.1;
  float s = sin(angle); float c = cos(angle);
  mat2 rot = mat2(c, -s, s, c);
  float collapse = 1.0 - decay * intensity * 0.42;
  return center + rot * d * collapse;
}

void main(){
  vec2 uv = vUv;
  vec2 center = uCenter;
  float intensity = clamp(uIntensity, 0.0, 1.0);
  float radius = max(uRadius, 0.12);
  vec2 d = uv - center;
  float dist = length(d);
  float pctCenter = 1.0 - smoothstep(0.0, radius, dist);
  vec2 suv = swirlUv(uv, center, radius, intensity, uTime);
  vec2 suvR = swirlUv(uv + vec2(0.004,0.0), center, radius, intensity, uTime);
  vec2 suvB = swirlUv(uv - vec2(0.004,0.0), center, radius, intensity, uTime);
  vec2 p = suv - center;
  float r = length(p);
  float theta = atan(p.y, p.x);
  float spiral = sin(theta*3.0 + r*22.0 - uTime*3.4) * exp(-r*2.8);
  float spiral2 = sin(theta*2.0 - r*16.0 + uTime*2.1) * exp(-r*3.2);
  float tight = pow(pctCenter, 0.62);
  spiral *= tight;
  spiral2 *= tight * 0.55;
  float rim = smoothstep(0.14, 0.28, dist) * smoothstep(0.68, 0.32, dist) * intensity;
  float cr = sin(atan((suvR - center).y, (suvR - center).x)*3.0 + length(suvR-center)*22.0 - uTime*3.4) * exp(-length(suvR-center)*2.8) * tight;
  float cb = sin(atan((suvB - center).y, (suvB - center).x)*3.0 + length(suvB-center)*22.0 - uTime*3.4) * exp(-length(suvB-center)*2.8) * tight;
  vec3 bg = vec3(0.012, 0.008, 0.014);
  vec3 spiralCol = vec3(1.0, 0.12, 0.26);
  vec3 spiralCol2 = vec3(0.52, 0.82, 0.80);
  vec3 col = bg;
  col = mix(col, spiralCol, clamp(spiral*0.55 + 0.5, 0.0, 1.0) * intensity * (0.72 + rim*0.35));
  col = mix(col, spiralCol2, clamp(spiral2*0.42 + 0.5, 0.0, 1.0) * intensity * 0.28);
  col.r += cr * 0.08 * rim;
  col.b += cb * 0.06 * rim;
  float vignette = 1.0 - smoothstep(0.35, 1.15, dist) * 0.55 * intensity;
  col *= vignette;
  float innerGlow = exp(-r*9.0) * 0.55 * intensity;
  col += vec3(1.0, 0.18, 0.32) * innerGlow;
  float hole = smoothstep(0.045, 0.018, r) * intensity;
  float holeRim = smoothstep(0.09, 0.05, r) * smoothstep(0.02, 0.06, r) * intensity;
  col = mix(col, vec3(0.0), hole*0.98);
  float eventRing = smoothstep(0.006, 0.0, abs(r - 0.032) - 0.004) * intensity;
  col += vec3(1.0, 0.14, 0.30) * eventRing * 0.65;
  col = mix(col, vec3(0.02,0.01,0.015), holeRim*0.35);
  float refract = sin(theta*12.0 + r*38.0 - uTime*6.0) * 0.015 * rim * intensity;
  col += vec3(refract);
  float alpha = 0.92 + 0.08*intensity;
  alpha *= mix(0.0, 1.0, smoothstep(0.0, 0.18, intensity));
  gl_FragColor = vec4(col, alpha);
}
`;
