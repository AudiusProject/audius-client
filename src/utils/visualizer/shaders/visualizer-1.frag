precision highp float;

uniform vec3 color;
uniform float opacity;
uniform bool useHue;
varying float vAngle;

#define PI 3.14
#pragma glslify: hsl2rgb = require('glsl-hsl2rgb')

void main() {
  vec3 tCol = color;
  if (useHue) {
    // float sat = 0.5;
    // float light = 0.5;
    // float hue = 0.0;

    //float sat2 = 0.5;
    // float light2 = 0.5;
    // float hue2 = 0.17;

    // float finalHue = mix(hue, hue2 - hue, sin(vAngle * 1.0));

    // float finalHue = hue * ( 1.0 - sin(vAngle * 1.0 / 0.5)) + hue2 * (sin(vAngle * 1.0 / 0.5));

    // float rainbow = sin(vAngle * 1.0);
    //hue += mix(0.0, 0.5, rainbow);

    // mix(hueA, hueB, sin(vAngle * 1.0))

    // tCol = hsl2rgb(vec3(finalHue, sat, light));

    float r1 = 255.0 / 255.0;
    float g1 = 0.0;
    float b1 = 0.0;
    
    float r2 = 0.0;
    float g2 = 255.0 / 255.0;
    float b2 = 0.0;

    float finalR = mix(r1, r2, sin(vAngle * 1.0));
    float finalG = mix(g1, g2, sin(vAngle * 1.0));
    float finalB = mix(b1, b2, sin(vAngle * 1.0));

    tCol = vec3(finalR, finalG, finalB);
  }
  
  gl_FragColor = vec4(tCol, opacity);
  gl_FragColor.rgb *= gl_FragColor.a;
}