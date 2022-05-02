"use strict";

// Функция инициализации шейдерной программы
export function initShaderProgram(gl, vsSource, fsSource) {
    // Загружаем вершинный шейдер
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    // Загружаем фрагментный шейдер
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    //Создаём программу и прикрепляем шейдеры к ней
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Обрабатываем ошибки
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Функция загрузки шейдера
function loadShader(gl, type, source) {
    // Создаём шейдер
    const shader = gl.createShader(type);

    // Компилируем шейдер
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Обрабатываем ошибки
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

export function loadTexture(gl, url, onLoad) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    // По умолчанию закрасим текстуру в синий
    const pixel = new Uint8Array([0, 0, 255, 255]);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

    // А когда загрузится картинка, загрузим её в текстуру
    const image = new Image();
    image.onload = () => {
        handleTextureLoaded(gl, image, texture);
        onLoad();
    };
    image.src = url;

    return texture;
}

function handleTextureLoaded(gl, image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
}