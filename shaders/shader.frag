#version 300 es
// WebGl требует явно установить точность флоатов, так что ставим 32 бита
precision mediump float;

uniform struct PointLight {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
} light;

in vec3 vnormal;
in vec3 vtangent;
in vec3 vbinormal;
in vec3 vlightDirection;
in vec3 vertexPos3;
in vec2 texCoord;
uniform vec4 uColor;
uniform sampler2D textureData;

out vec4 color;

vec3 lambert(PointLight light, vec3 normal, vec3 lightDirection) {
    float diffuseLightDot = max(dot(normal, lightDirection), 0.0);
    return light.ambient + light.diffuse * diffuseLightDot;
}

const float shininess = 16.0;

vec3 blinn(PointLight light, vec3 normal, vec3 lightDirection, vec3 eye) {
    vec3 H = normalize(lightDirection - eye);
    float specularLightDot = max(dot(normal, H), 0.0);
    float specularLightParam = pow(specularLightDot, shininess);
    return lambert(light, normal, lightDirection) + light.specular * specularLightParam;
}

void main() {
    vec3 normal = normalize(vnormal);
    vec3 lightDirection = normalize(vlightDirection);

    float step = 0.00128;

    float x_plus = texture(textureData, vec2(texCoord.x + step, texCoord.y)).x;
    float x_minus = texture(textureData, vec2(texCoord.x - step, texCoord.y)).x;
    float y_plus = texture(textureData, vec2(texCoord.x, texCoord.y + step)).x;
    float y_minus = texture(textureData, vec2(texCoord.x, texCoord.y - step)).x;

    float x_gradient = x_minus - x_plus;
    float y_gradient = y_minus - y_plus;

    vec3 U = normalize(vtangent);
    vec3 V = normalize(vbinormal);

    vec3 bumpNormal = normal + U * x_gradient + V * y_gradient;
    color = vec4(blinn(light, bumpNormal, lightDirection, vertexPos3) * vec3(uColor), uColor.a);
}