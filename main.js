"use strict";
import { initShaderProgram, loadTexture } from './webGL';
import vsSource from './shaders/shader.vert';
import fsSource from './shaders/shader.frag';

import { sphere } from './sphere';

const OBJ = require('webgl-obj-loader');


window.onload = function main() {
    const canvas = document.querySelector("#gl_canvas");
    const gl = canvas.getContext("webgl2");

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);

    const programInfo = initProgramInfo(gl, () => drawScene(gl, programInfo, onDrow));

    const onDrow = initOnDrowFunc(gl);
    drawScene(gl, programInfo, onDrow);
}


function initProgramInfo(gl, onLoad) {
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    return {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'avertexPosition'),
            normalPosition: gl.getAttribLocation(shaderProgram, 'anormalPosition'),
            textureCoords: gl.getAttribLocation(shaderProgram, 'textureCoords'),
        },
        uniformLocations: {
            color: gl.getUniformLocation(shaderProgram, 'uColor'),
            modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix'),
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),

            lightPosition: gl.getUniformLocation(shaderProgram, 'light.position'),
            lightAmbient: gl.getUniformLocation(shaderProgram, 'light.ambient'),
            lightDiffuse: gl.getUniformLocation(shaderProgram, 'light.diffuse'),
            lightSpecular: gl.getUniformLocation(shaderProgram, 'light.specular'),

            textureData: gl.getUniformLocation(shaderProgram, 'textureData'),
        },
        textures: {
            textureMaterial: loadTexture(gl, document.getElementById("map").src, onLoad),
        }
    };
}



function setupLights(gl, { uniformLocations }) {
    gl.uniform3fv(uniformLocations.lightPosition, [0.0, 15.0, 20.0]);
    gl.uniform3fv(uniformLocations.lightAmbient, [0.27, 0.4, 0.1]);
    gl.uniform3fv(uniformLocations.lightDiffuse, [0.54, 0.9, 0.0]);
    gl.uniform3fv(uniformLocations.lightSpecular, [0.25, 0.3, 1.0]);
}

function drawScene(gl, programInfo, onDraw) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(programInfo.program);

    setupLights(gl, programInfo);

    const fieldOfView = 30 * Math.PI / 180;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 100.0);
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, programInfo.textures.textureMaterial);
    gl.uniform1i(programInfo.uniformLocations.textureData, 0);

    onDraw(gl, programInfo);
}


function getOrangeFromFile() {
    return new OBJ.Mesh(sphere, {
        calcTangentsAndBitangents: true
    });
}

function convertToGlBuffer(gl, array) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
    return buffer
}

function initBuffer(gl, index, buffer) {
    gl.enableVertexAttribArray(index);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(index, buffer.itemSize, gl.FLOAT, false, 0, 0);
}

function initBufferWithSize(gl, index, buffer, size) {
    gl.enableVertexAttribArray(index);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0);
}

export function initOnDrowFunc(gl) {
    let mesh = getOrangeFromFile();

    const tangentsBuffer = convertToGlBuffer(gl, mesh.tangents);
    const binormalsBuffer = convertToGlBuffer(gl, mesh.bitangents);

    let model = mat4.create();

    return (gl, programInfo) => {
        //model matrix
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, model);

        // view matrix
        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, [4.0, 3.0, 4.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0])
        gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);

        //normal matrix
        const nMatrix = mat3.create();
        mat3.normalFromMat4(nMatrix, model)
        gl.uniformMatrix3fv(programInfo.uniformLocations.normalMatrix, false, nMatrix);

        gl.uniform4fv(programInfo.uniformLocations.color, [1.0, 0.33, 0.0, 1.0]);

        OBJ.initMeshBuffers(gl, mesh);

        initBuffer(gl, 0, mesh.vertexBuffer);
        initBuffer(gl, 1, mesh.normalBuffer);
        initBuffer(gl, 2, mesh.textureBuffer);

        initBufferWithSize(gl, 3, tangentsBuffer, 3);
        initBufferWithSize(gl, 4, binormalsBuffer, 3);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        gl.drawElements(gl.TRIANGLES, mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }
};
