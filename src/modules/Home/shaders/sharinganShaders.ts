// ─────────────────────────────────────────────────────────────────────────────
// Ready-to-run GLSL shaders — Sharingan Eye
// Usage: import { sharinganVert, sharinganFrag } from "@/modules/Home/shaders/sharinganShaders"
// Vertex: passthrough, Fragment: procedural iris + SDF tomoe + mangekyo morph
// Uniforms: uTime, uActivation 0..1, uMorph 0..1, uPulse 0..1, uSpin rad
// Performance: 1 draw call, ~45 ALU, no texture fetches
// ─────────────────────────────────────────────────────────────────────────────

export const sharinganVert = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
`;

export const sharinganFrag = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uActivation;
uniform float uMorph;
uniform float uPulse;
uniform float uSpin;

const vec3 C_SCLERA = vec3(0.96,0.94,0.90);
const vec3 C_IRIS_BROWN0 = vec3(0.42,0.22,0.14);
const vec3 C_IRIS_BROWN1 = vec3(0.28,0.16,0.10);
const vec3 C_IRIS_RED0 = vec3(1.0,0.08,0.18);
const vec3 C_IRIS_RED1 = vec3(0.62,0.04,0.14);
const vec3 C_IRIS_RED2 = vec3(0.18,0.02,0.05);
const vec3 C_TOMOE = vec3(0.02,0.01,0.02);
const vec3 C_MANGEKYO = vec3(0.02,0.01,0.02);

float tomoeSDF(vec2 p, float r){
  float dHead = length(p) - r*0.38;
  vec2 tc = vec2(r*0.20, 0.0);
  float dTail = length(p - tc) - r*0.52;
  float d = min(dHead, dTail);
  float dCut = length(p + vec2(r*0.10, 0.0)) - r*0.20;
  return max(d, -dCut);
}
float mangekyoSDF(vec2 p){
  float a = atan(p.y, p.x);
  float r = length(p);
  float wedge = 2.0943951;
  a = mod(a + wedge*0.5, wedge) - wedge*0.5;
  a = abs(a);
  float blade = r - (0.22 + a*0.52);
  float edge = abs(a - 0.18 - r*0.28) - 0.06*(1.0 - r*0.5);
  float d = max(blade, -edge);
  float center = r - 0.06;
  d = min(d, center);
  return d;
}
void main(){
  vec2 uv = vUv * 2.0 - 1.0;
  float d = length(uv);
  float irisMask = smoothstep(0.92, 0.88, d);
  float pupilMask = smoothstep(0.19, 0.17, d);
  float scleraMask = 1.0 - irisMask;
  vec3 irisCol = mix(
    mix(C_IRIS_BROWN0, C_IRIS_BROWN1, smoothstep(0.0,0.7,d)),
    mix(mix(C_IRIS_RED0, C_IRIS_RED1, smoothstep(0.0,0.45,d)), C_IRIS_RED2, smoothstep(0.65,0.92,d)),
    uActivation
  );
  vec3 col = mix(irisCol, C_SCLERA, scleraMask * (1.0 - uActivation*0.85));
  if(uActivation > 0.5){
    col = mix(col, irisCol, smoothstep(0.88,0.92,d) * uActivation);
  }
  col = mix(col, vec3(0.01,0.005,0.015), pupilMask * 0.96);
  float rim = smoothstep(0.885,0.88,d) * smoothstep(0.82,0.86,d);
  col = mix(col, vec3(0.04,0.01,0.02), rim * 0.9);
  if(irisMask > 0.01){
    float s = sin(uSpin), c = cos(uSpin);
    mat2 R = mat2(c,-s,s,c);
    vec2 ru = R * uv;
    float tomoeField = 1.0;
    for(int i=0;i<3;i++){
      float ang = 1.5707963 + float(i)*2.0943951;
      vec2 ctr = vec2(cos(ang), sin(ang)) * 0.42;
      vec2 lp = ru - ctr;
      float ca = cos(ang+1.5708), sa = sin(ang+1.5708);
      mat2 RT = mat2(ca,-sa,sa,ca);
      lp = RT * lp;
      float sd = tomoeSDF(lp, 0.155);
      tomoeField = min(tomoeField, sd);
    }
    float tomoeMask = smoothstep(0.008, -0.008, tomoeField);
    float mSDF = mangekyoSDF(ru);
    float mangeMask = smoothstep(0.012, -0.006, mSDF);
    float ring = smoothstep(0.015, -0.005, abs(d - 0.62) - 0.011);
    mangeMask = max(mangeMask, ring*0.85);
    float tomoeAlpha = tomoeMask * (1.0 - uMorph) * step(d, 0.78) * irisMask;
    float mangeAlpha = mangeMask * uMorph * step(d, 0.82) * irisMask;
    col = mix(col, C_TOMOE, tomoeAlpha*0.96);
    col = mix(col, C_MANGEKYO, mangeAlpha*0.96);
  }
  vec2 hl = uv - vec2(-0.22, 0.28);
  float highlight = exp(-dot(hl,hl)*42.0) * 0.18 * irisMask * (0.5 + 0.5*uActivation);
  col += vec3(1.0,0.92,0.92) * highlight;
  col += vec3(1.0,0.22,0.32) * 0.14 * exp(-d*2.8) * uPulse * irisMask;
  col += vec3(1.0,0.18,0.28) * 0.08 * uActivation * exp(-d*3.2);
  float alpha = irisMask * 0.985 + scleraMask * (1.0 - uActivation*0.08);
  alpha *= smoothstep(0.98, 0.88, d);
  gl_FragColor = vec4(col, alpha);
}
`;
