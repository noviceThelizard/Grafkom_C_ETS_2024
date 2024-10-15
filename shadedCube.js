"use strict";

var shadedCube = function() {

var canvas;
var gl;

var numPositions = 36;

var positionsArray = [];
var normalsArray = [];

var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),
        vec4(-0.5,  0.5,  0.5, 1.0),
        vec4(0.5,  0.5,  0.5, 1.0),
        vec4(0.5, -0.5,  0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5,  0.5, -0.5, 1.0),

      //   vec4(-0.5,  0.5, -0.5, 1.0),
      //   vec4(-0.5, -0.5, -0.5, 1.0)
      //   vec4(0.5,  0.5, -0.5, 1.0),
      //   vec4(0.5, -0.5, -0.5, 1.0)
    ];


var color = [
   vec4(1.0, 1.0, 1.0, 1.0), //white
   vec4(0.0, 1.0, 1.0, 1.0), //yellow
   vec4(1.0, 0.0, 0.0, 1.0), //red
   vec4(0.0, 0.0, 1.0, 1.0), //blue
   vec4(0.0, 1.0, 0.0, 1.0), //green
   vec4(1.0, 1.0, 0.0, 1.0), //orange
   vec4(0.0, 0.0, 0.0, 1.0) //should be black
];

function i1(value) {
   return (value/255).toFixed(2);
}

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelViewMatrix, projectionMatrix;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta = vec3(0, 0, 0);

var thetaLoc;

var isReset = false;
var flag = false;

document.getElementById("MakeCube").onclick = function(){
   vertices.push(vec4(0.5,  0.5, -0.5, 1.0));
   vertices.push(vec4(0.5, -0.5, -0.5, 1.0));
   init();
};

document.getElementById("MakePrism").onclick = function(){
   vertices.push(vec4(-0.5,  0.5, -0.5, 1.0));
   vertices.push(vec4(-0.5, -0.5, -0.5, 1.0));
   init();
};

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     normal = vec3(normal);


     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     positionsArray.push(vertices[b]);
     normalsArray.push(normal);
     positionsArray.push(vertices[c]);
     normalsArray.push(normal);

     positionsArray.push(vertices[a]);
     normalsArray.push(normal);
     positionsArray.push(vertices[c]);
     normalsArray.push(normal);
     positionsArray.push(vertices[d]);
     normalsArray.push(normal);
}


function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function init() {
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert( "WebGL 2.0 isn't available");


    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0);

    projectionMatrix = ortho(-1, 1, -1, 1, -100, 100);

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){flag = !flag;};
    document.getElementById("ButtonResetR").onclick = function(){isReset = true};
    
   //  document.getElementById("ButtonUp").onclick = function() {
   //     if (lightPosition[1] > -1) lightPosition[1] -= 0.2;
   // };
   // document.getElementById("ButtonDown").onclick = function() {
   //     if (lightPosition[1] < 1) lightPosition[1] += 0.2;
   //  };

   //  document.getElementById("ButtonLeft").onclick = function() {
   //    if (lightPosition[0] < 1) lightPosition[0] += 0.2;
   //  };
   //  document.getElementById("ButtonRight").onclick = function() {
   //    if (lightPosition[0] > -1) lightPosition[0] -= 0.2;
   //   };

    gl.uniform4fv(gl.getUniformLocation(program, "uAmbientProduct"),
       ambientProduct);
    gl.uniform4fv(gl.getUniformLocation(program, "uDiffuseProduct"),
       diffuseProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uSpecularProduct"),
       specularProduct );
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
       lightPosition );

    gl.uniform1f(gl.getUniformLocation(program,
       "uShininess"), materialShininess);

    gl.uniformMatrix4fv( gl.getUniformLocation(program, "uProjectionMatrix"),
       false, flatten(projectionMatrix));

   render();
}

function render(){

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    lightPosition[0] = document.getElementById('Light_X').value/10;
    lightPosition[1] = document.getElementById('Light_Y').value/10;
    lightPosition[2] = document.getElementById('Light_Z').value/10;
    
    if(isReset) {
      flag = false;
      theta[0] = 0.0;
      theta[1] = 0.0;
      theta[2] = 0.0;
      isReset = false;
      // if (theta[0] != 0)
      // {
      //    theta[0] += 1.0;
      // } else if (theta[0] == 0) {
      //    isReset = false;
      // }
    }

    if(flag) {
       document.getElementById('Rot_X').disabled =true;
       document.getElementById('Rot_Y').disabled =true;
       document.getElementById('Rot_Z').disabled =true;
       theta[axis] += 2.0; //rotate or not
       if(theta[axis]%45==1 || theta[axis]%90==0) flag = false;
    } else {
      // document.getElementById('Rot_X').disabled =false;
      // document.getElementById('Rot_Y').disabled =false;
      // document.getElementById('Rot_Z').disabled =false;
      // theta[0] = document.getElementById('Rot_X').value;
      // theta[1] = document.getElementById('Rot_Y').value;
      // theta[2] = document.getElementById('Rot_Z').value;
    }


    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"),
       lightPosition );

    modelViewMatrix = mat4();
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], vec3(1, 0, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], vec3(0, 1, 0)));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], vec3(0, 0, 1)));


    //console.log(modelView);

    gl.uniformMatrix4fv(gl.getUniformLocation(program,
            "uModelViewMatrix"), false, flatten(modelViewMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    requestAnimationFrame(render);
}

}

shadedCube();
