precision highp float;

uniform vec3 color;
uniform float opacity;
varying float vAngle;

#define PI 3.14

void main() {
  vec3 tCol = color;
  float r1 = 0.0;
  float g1 = 0.0;
  float b1 = 0.0;
  
  float r2 = 0.0;
  float g2 = 0.0;
  float b2 = 0.0;

  float r3 = 0.0;
  float g3 = 0.0;
  float b3 = 0.0;

  float interp = sin(vAngle * 1.0);
  float finalR;
  float finalG;
  float finalB;
  if (interp > 0.0) {
    finalR = mix(r1, r2, interp);
    finalG = mix(g1, g2, interp);
    finalB = mix(b1, b2, interp);
  } else {
    finalR = mix(r1, r3, -1.0 * interp);
    finalG = mix(g1, g3, -1.0 * interp);
    finalB = mix(b1, b3, -1.0 * interp);
  }

  tCol = vec3(finalR, finalG, finalB);
  
  gl_FragColor = vec4(tCol, opacity);
  gl_FragColor.rgb *= gl_FragColor.a;
}