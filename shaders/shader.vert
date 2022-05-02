#version 300 es
precision mediump float;

in vec3 avertexPosition;
in vec3 anormalPosition;
in vec2 textureCoords;
in vec3 tangent;
in vec3 binormal;

uniform struct PointLight {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
} light;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vnormal;
out vec3 vtangent;
out vec3 vbinormal;
out vec3 vlightDirection;
out vec3 vertexPos3;
out vec2 texCoord;

void main() {
    vec4 vertexPositionEye4 = uViewMatrix * uModelMatrix * vec4(avertexPosition, 1.0);
    vec3 vertexPositionEye3 = vertexPositionEye4.xyz / vertexPositionEye4.w;

    vec3 lightDirection = normalize(light.position - vertexPositionEye3);
    vec3 normal = normalize(uNormalMatrix * anormalPosition);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(avertexPosition, 1.0);

    vnormal = normal;
    vtangent = tangent;
    vbinormal = binormal;
    vlightDirection = lightDirection;
    vertexPos3 = vertexPositionEye3;
    texCoord = textureCoords;
}