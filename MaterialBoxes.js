// ==========================================================================
// $Id: MaterialBoxes.js,v 1.2 2019/03/09 18:15:33 jlang Exp $
// Lighting with materials
// Code based on LitBoxes.js
// Revision 1.5  2019/03/07 06:16:01  jlang
// ==========================================================================
// (C)opyright:
//
//   This code is heavily based on the WebGL Programming
//   Guide by Kouichi Matsuda and Rodger Lea and is their copyright.
//   See https://sites.google.com/site/webglbook/
//
//   The code posted is re-used with the generours permission by the authors.
//
//   Jochen Lang
//   EECS, University of Ottawa
//   800 King Edward Ave.
//   Ottawa, On., K1N 6N5
//   Canada.
//   http://www.eecs.uottawa.ca
//
// Creator: jlang (Jochen Lang)
// Email:   jlang@eecs.uottawa.ca
// ==========================================================================
// $Log: MaterialBoxes.js,v $
// Revision 1.2  2019/03/09 18:15:33  jlang
// Included solution and starter code.
//
// Revision 1.1  2019/03/08 22:42:43  jlang
// First draft of material lab
//
// ==========================================================================
// Based on (c) 2012 matsuda -- is any of this still true?
// HelloTriangle.js
// Loadshaderfromfiles.js
// RotateTriangles_withButtons.js
// LookAtTrianglesWithKeys.js
// TexturedQuad.js
// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;

// Rotation speed (degrees/second)
var SPEED;
// Light angle
var ANGLE = 0.0;
var TES = 0.0;
var TESS = 1.0;

var cShading = true;

//Ajout variable

//Ajout variable

const NUM_LIGHTS = 2;

// Initialize time of last rotation update
var LAST_FRAME = Date.now();
var VAO;

// Number of boxes
const N_BOXES = 35;

const USE_UBO = true;

var gl = null;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
 setDefault(); // set global variables to default

  // Read shader from file
  readShaderFile(gl, 'shader/mat_boxes.vs', 'v');
  readShaderFile(gl, 'shader/mat_boxes.fs', 'f');
}


// Read shader from file
function readShaderFile(gl, fileName, shader) {
    var request = new XMLHttpRequest();
    request.open('GET', fileName , true);


  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status !== 404) {
	onReadShader(gl, request.responseText, shader);
  }
  }
  // Create a request to acquire the file

  request.send();                      // Send the request
}


// The shader is loaded from file
function onReadShader(gl, fileString, shader) {
  if (shader == 'v') { // Vertex shader
    VSHADER_SOURCE = fileString;
  } else
  if (shader == 'f') { // Fragment shader
    FSHADER_SOURCE = fileString;
  }
  // When both are available, call start().
  if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl);
}

function changecShading() {
  if (cShading == true) {
    cShading = false;
  } else {
    cShading = true;
  }
}


function start(gl) {

  // Initialize shaders - string now available
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  // Must enable depth test for proper 3D display
  gl.enable(gl.DEPTH_TEST);
  // Set clear color - state info	
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Specify the rot_matrix as a uniform
  // get the storage location of mvp_matrix
  var u_rot_matrix = gl.getUniformLocation(gl.program, 'rot_matrix');
  if (!u_rot_matrix) {
    console.log('Failed to get the storage location of rot_matrix');
    u_rot_matrix = 0;
    // return;
  }

  // Create the matrix to set the projection matrix
  var projMatrix = glMatrix.mat4.create();
  // glMatrix.mat4.ortho(projMatrix,-12.0, 12.0, -12.0, 12.0, 8.0, 32.0);
  glMatrix.mat4.perspective(projMatrix, Math.PI/2, 1.0, 8.0, 32.0);

  var u_proj_matrix = gl.getUniformLocation(gl.program, 'proj_matrix');
  if (u_proj_matrix) {
     gl.uniformMatrix4fv(u_proj_matrix, false, projMatrix );
  } else {
    console.log('Failed to get the storage location of proj_matrix');
    u_proj_matrix = 0;
    // return;
  }

  let matArray = makeMaterialArray();
  if ( USE_UBO ) {
      // Create a uniform buffer object
      var ubo = gl.createBuffer();
      if (!ubo) {
	  console.log('Failed to create uniform buffer object');
	  return -1;
      }
      // Bind the buffer object to target
      gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
      // reserve memory
      gl.bufferData(gl.UNIFORM_BUFFER, matArray.length * matArray[0].bufSize * Float32Array.BYTES_PER_ELEMENT, gl.STATIC_DRAW );
      // Write data into the buffer object
      for ( let index=0; index < matArray.length; index++ ) {
	  matArray[index].setMaterialUBO( gl, index, ubo );
      }
      let bI = gl.getUniformBlockIndex(gl.program, 'MaterialBlock');
      if ( bI != null ) {
	  gl.uniformBlockBinding( gl.program, bI, 0);
	  gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, ubo);
      }
  } else {
      for ( let index=0; index < matArray.length; index++ ) {
	  matArray[index].setMaterial( gl, gl.program, index );
      }
  }
    
  var lights = [ new LightSource(), new LightSource()];
  // directional light from upper left center - default
  glMatrix.vec4.set(lights[0].diffuse, 0.5, 0.5, 0.5, 1);

  // spot light from right
  //glMatrix.vec4.set(lights[1].position, 15, 0, 0, 1);
  //glMatrix.vec3.set(lights[1].spot_direction, 0, 0, -1);

  // Initialize lights
  var lghtCtrl = [];	
  for ( let index=0; index < lights.length; index++ ) {
    // setup the controls - we could use keys and buttons
    // dat.gui is really made for trying and playing with paramaters
    lghtCtrl.push(new function() {
	//this.spot_light = (lights[index].spot_light > 0);
	//this.spot_exponent = lights[index].spot_exponent;
	//this.spot_cutoff = lights[index].spot_cutoff;
	//this.constant_attenuation = lights[index].constant_attenuation;
	//this.linear_attenuation = lights[index].linear_attenuation;
  //this.quadratic_attenuation = lights[index].quadratic_attenuation;
	this.diffuse = [ Math.trunc(255*lights[index].diffuse[0]),
			 Math.trunc(255*lights[index].diffuse[1]),
			 Math.trunc(255*lights[index].diffuse[2])];
	this.specular = [ Math.trunc(255*lights[index].specular[0]),
			  Math.trunc(255*lights[index].specular[1]),
			  Math.trunc(255*lights[index].specular[2])];
	this.ambient = [ Math.trunc(255*lights[index].ambient[0]),
			 Math.trunc(255*lights[index].ambient[1]),
       Math.trunc(255*lights[index].ambient[2])];

	this.smooth_flat = function () {
    if (cShading == true) {
      cShading = false;
      initVertexBuffers(gl)
    } else {
      cShading = true;
      initVertexBuffers(gl)
    }
    draw(gl, n, currentAngle, axisAngle, u_rot_matrix);
    console.log(cShading);
  }
	this.light = lights[index];
	this.index = index;
	
	this.setLight = function() {
	  this.light.setLight(gl, gl.program, this.index);
	  this.light.setPosition(gl, gl.program, this.index);
	}
	this.setDirectional = function( value ) {
	    this.light.setDirectional(value);
	    this.setLight();
	}
	this.setSpotLight = function( value ) {
	    this.light.setSpotLight( value );
	    this.setLight();
	}
	this.setSpotExponent = function( value ) {
	  this.light.spot_exponent = value;
	  this.setLight();
	}
	this.setSpotCutoff = function(value) {
	  this.light.spot_cutoff = value;
	  this.setLight();
	}
	this.setConstantAttenuation = function(value) {
	  this.light.constant_attenuation = value;
	  this.setLight();
	}
	this.setLinearAttenuation = function(value) {
	  this.light.linear_attenuation = value;
	  this.setLight();
	}
	this.setQuadraticAttenuation = function(value) {
	  this.light.quadratic_attenuation = value;
	  this.setLight();
  }
	this.setDiffuse = function(value) {
	  this.light.diffuse[0] = value[0]/255.0;
	  this.light.diffuse[1] = value[1]/255.0;
	  this.light.diffuse[2] = value[2]/255.0;
	  this.setLight();
	}
	this.setSpecular = function(value) {
	  this.light.specular[0] = value[0]/255.0;
	  this.light.specular[1] = value[1]/255.0;
	  this.light.specular[2] = value[2]/255.0;
	  this.setLight();
	}
	this.setAmbient = function(value) {
	  this.light.ambient[0] = value[0]/255.0;
	  this.light.ambient[1] = value[1]/255.0;
	  this.light.ambient[2] = value[2]/255.0;
	  this.setLight();
  }
      });
    lghtCtrl[index].setLight();
  }
  var gui = new dat.GUI();
  var lt0 = gui.addFolder('Light');
  setLightMenu( lt0, lghtCtrl[0] );
  //var lt1 = gui.addFolder('Light 1');
  //setLightMenu( lt1, lghtCtrl[1] );

  // Current axis angle
  var axisAngle = 0.0;
  // Current rotation angle
  var currentAngle = 0.0;

  // Register the event handler to be called on key press
  document.onkeydown = function(ev){
      keydown(ev, gl, n, currentAngle, axisAngle, u_rot_matrix, lights[0], 1 )};
    

  // Register the animation callback
  var tick = function() {

    var now = Date.now();
    var elapsed = now - LAST_FRAME;
    currentAngle = animate(currentAngle, SPEED, elapsed );  // Update the rotation angle
    axisAngle = animate(axisAngle, SPEED/7.0, elapsed );  // Update the axis angle
    LAST_FRAME = now;
    draw(gl, n, currentAngle, axisAngle, u_rot_matrix); // Draw the boxes
    requestAnimationFrame(tick);   // Request that the browser calls tick
  };
  tick();
}

  
function setLightMenu( fldr, controls ) {
  //let setLight = controls.setLight.bind(controls);
  for (let key in controls) {
    if (typeof controls[key] == 'function') {
      controls[key] = controls[key].bind(controls);
    }
  }
  fldr.addColor(controls, 'diffuse').onChange(controls.setDiffuse);
  fldr.addColor(controls, 'specular').onChange(controls.setSpecular);
  fldr.addColor(controls, 'ambient').onChange(controls.setAmbient);
  //fldr.addColor(controls, 'emissive').onChange(controls.setEmissive);	
  fldr.add(controls, 'smooth_flat').onChange(controls.setDirectional);
  //fldr.add(controls, 'constant_attenuation', 0.0, 1.0, 0.01).onChange(controls.setConstantAttenuation);
  //fldr.add(controls, 'linear_attenuation', 0.0, 1.0, 0.01).onChange(controls.setLinearAttenuation);
  //fldr.add(controls, 'quadratic_attenuation', 0.0, 1.0, 0.01).onChange(controls.setQuadraticAttenuation);
  //fldr.add(controls, 'spot_light').onChange(controls.setSpotLight);
  //fldr.add(controls, 'spot_exponent', 0, 10, 0.01).onChange(controls.setSpotExponent);
  //fldr.add(controls, 'spot_cutoff', 0.0, 90.0).onChange(controls.setSpotCutoff);
}


function initVertexBuffers(gl) {
  // num. colors and transforms
  let minV = glMatrix.vec3.fromValues(-10.0,-10.0,-9.0);
  let maxV = glMatrix.vec3.fromValues(10.0,10.0,-9.0);	
  var attr = new Attributes( N_BOXES, N_BOXES, minV, maxV );
  var box = new SphereShape(attr);
    
  // Get vertices of the box and store in VBO
  VAO = gl.createVertexArray(); // VAO is a global
  gl.bindVertexArray(VAO);

  // Element array buffer object
  elementBuffer = gl.createBuffer(); // element buffer is global
  if (!elementBuffer) {
    console.log('Failed to create the element buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer );
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, box.index, gl.STATIC_DRAW);
    
  // Create a vertex buffer object
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the vertex buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, box.vertex, gl.STATIC_DRAW);

  var a_vertex = gl.getAttribLocation(gl.program, 'a_vertex');
  if (a_vertex < 0) {
    console.log('Failed to get the storage location of a_vertex');
    return -1;
  }
  // 3 entries per vertex: x y z 
  gl.enableVertexAttribArray(a_vertex);
  gl.vertexAttribPointer(a_vertex, 3, gl.FLOAT, false, 0, 0);

  // Create a color buffer object
  var colorBuffer = gl.createBuffer();
  if (!colorBuffer) {
    console.log('Failed to create the color buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, box.attrib.colors, gl.STATIC_DRAW);

  // Get the storage location of a_color, assign buffer and enable
  var a_color = gl.getAttribLocation(gl.program, 'a_color');
  if(a_color < 0) {
    console.log('Failed to get the storage location of a_color');
    // return -1;
  } else {
    gl.vertexAttribDivisor(a_color, 1);
    // Colors 4 entries per vertex - r g b a
    gl.enableVertexAttribArray(a_color);
    gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
  }
  // Create a normal buffer object
  var normalBuffer = gl.createBuffer();
  if (!normalBuffer) {
    console.log('Failed to create the normal buffer object');
    return -1;
  }
  
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  // Write data into the buffer object
  if (cShading == true){
    gl.bufferData(gl.ARRAY_BUFFER, box.normal2, gl.STATIC_DRAW);
  } else {
    gl.bufferData(gl.ARRAY_BUFFER, box.normal, gl.STATIC_DRAW);
  }
 
  // Get the storage location of a_normal, assign buffer and enable
  var a_normal = gl.getAttribLocation(gl.program, 'a_normal');
  if(a_normal < 0) {
    console.log('Failed to get the storage location of a_normal');
    // return -1;
  } else {
    // Normals 3 entries per vertex - nx ny nz
    gl.enableVertexAttribArray(a_normal);
    gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, true, 0, 0);
  }
  
  // Matrix attribute
  var mmBuffer = gl.createBuffer();
  if (!mmBuffer) {
    console.log('Failed to create the matrix buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, mmBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,box.attrib.tfms,gl.DYNAMIC_DRAW);
  // Figure out how many byte per element
  var sz = box.attrib.tfms.BYTES_PER_ELEMENT;
    
  var locMM = gl.getAttribLocation( gl.program, 'model_matrix');
  // Need to set attribute for each column separately.
  for (let i = 0; i < 4; i++) {
    // Set up the vertex attribute
    gl.vertexAttribPointer(locMM + i,             // Location
			   4, gl.FLOAT, false,    // Column with four floats, no normalization
			   sz * 16,               // Stride for next 4x4 matrix
			   sz * 4 * i);           // Offset for ith column
    gl.enableVertexAttribArray(locMM + i);
    // Matrix per instance
    gl.vertexAttribDivisor(locMM  + i, 1);
  }

  gl.bindVertexArray(null);
  return box.index.length; // number of indicies
}


function draw(gl, n, currentAngle, axisAngle, u_rot_matrix) {
  // Set the rotation matrix
    let rotMatrix = glMatrix.mat4.create();  
  glMatrix.mat4.fromYRotation(rotMatrix, glMatrix.glMatrix.toRadian(axisAngle));
  glMatrix.mat4.rotateX(rotMatrix, rotMatrix, glMatrix.glMatrix.toRadian(currentAngle));
  if ( u_rot_matrix != 0 ) {
     gl.uniformMatrix4fv(u_rot_matrix, false, rotMatrix );
  }
  // Clear <canvas> - both color and depth
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindVertexArray(VAO);
  // element array buffer is not part of the VAO - but is still bound
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer );
  // primitive restart cannot be enabled - it is always on
  // gl.enable(gl.PRIMITIVE_RESTART);
  gl.drawElementsInstanced(gl.TRIANGLE_STRIP, n, gl.UNSIGNED_BYTE, 0, N_BOXES);

  // Draw the rectangle
  //gl.drawArrays(gl.TRIANGLES, 0, n);
}


// Make a time based animation to keep things smooth
// Initialize global variable
function animate(angle,speed,elapsed) {
  // Calculate the elapsed time
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (speed * elapsed) / 1000.0;
  return newAngle %= 360;
}

function keydown(ev, gl, n, currentAngle, axisAngle, u_rot_matrix, lght, index) {
  switch(ev.keyCode) {
  case 38: // up arrow key
    SPEED += 2.0;
    break;
  case 40: // down arrow key
    SPEED -= 2.0;
    break;
  case 37: // left arrow key
    ANGLE -= 0.1;
    break;
  case 39: // right arrow key
    ANGLE += 0.1;
    break;
  // AWSD keys controls
  case 87: // W key
  if (TES<250) {TES += 10;}
    break;
  case 83: // S key
  if (TES>-250) {TES -= 10;}
    break;
  case 65: // A key
    if (TESS>-10) {TESS -= 0.5;}
    break;
  case 68: // D key
    if (TESS<10) {TESS += 0.5;}
    break;
  }
  glMatrix.vec4.set(lght.position,15.0*Math.cos(ANGLE),15.0*Math.sin(ANGLE),TES,TESS);  
  lght.setPosition( gl, gl.program, index );
  draw(gl, n, currentAngle, axisAngle, u_rot_matrix);
}

function setDefault() {
  SPEED = 20.0;
}

function faster() {
  SPEED += 2;
}

function slower() {
  SPEED -= 2;
}
