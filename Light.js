// ==========================================================================
// $Id: Light.js,v 1.1 2019/03/08 22:42:42 jlang Exp $
// Light source class for light structure
// ==========================================================================
// (C)opyright:
//
//   Jochen Lang
//   EECS, University of Ottawa
//   800 King Edward Ave.
//   Ottawa, On., K1N 6N5
//   Canada.
//   http://www.eecs.uottawa.ca
//
// Creator: Jochen Lang
// Email:   jlang@uottawa.ca
// ==========================================================================
// $Log: Light.js,v $
// Revision 1.1  2019/03/08 22:42:42  jlang
// First draft of material lab
//
// Revision 1.4  2019/03/07 05:59:03  jlang
// solution
//
// Revision 1.3  2019/03/07 02:50:01  jlang
// Working dat.gui and basic lighting
//
// Revision 1.2  2019/03/05 18:27:02  jlang
// Implementation complete but still to be debugged.
//
// Revision 1.1  2019/03/04 03:31:16  jlang
// Initial draft. No lighting yet.
//
// ==========================================================================

// Constructor ... parameters
function LightSource() {
  this.ambient = glMatrix.vec4.fromValues(0.2,0.2,0.2,1.0);
  this.diffuse = glMatrix.vec4.fromValues(1.0,1.0,1.0,1.0);
  this.specular = glMatrix.vec4.fromValues(1.0,1.0,1.0,1.0);
  // switch between point and directional light source is based on w of light position
  // spot light
  // v is the vector to the vertex
  // if dir*v < cos(cutoff) then (dir * v)^N
  this.spot_light = 0;  
  this.spot_direction = glMatrix.vec3.fromValues(1.0,1.0,-1.0);
  this.spot_exponent = 0;
  this.spot_cutoff = 90.0;
  // attentuation 1/(k_c + k_l r + k_q r^2) 
  // r is the distance of a vertex from the light source
  this.constant_attenuation = 1.0;
  this.linear_attenuation = 0.0;
  this.quadratic_attenuation = 0.0;
  // Finally the light position - directional lights with w = 0.
  this.position = glMatrix.vec4.fromValues(-1.0,1.0,1.0,0.0); //2e et 4e
  glMatrix.vec3.normalize(this.position,this.position); 
  this._posLength = 1.0;
}

LightSource.prototype.setDirectional = function( value ) {
    if ( this.position[3] > 1e-6 ) {
	this._posLength = glMatrix.vec3.length(this.position);
    }
    if ( value ) {
	this.position[3] = 0.0;
	glMatrix.vec3.normalize(this.position,this.position); 
	this.constant_attenuation = 1.0;
	this.linear_attenuation = 0.0;
	this.quadratic_attenuation = 0.0;
    } else {
	glMatrix.vec3.scale(this.position,this.position,this._posLength);
	this.position[3] = 1.0;
    }
    return;
}

LightSource.prototype.setSpotLight = function( value ) {
    if ( value ) {
	this.spot_light = 1;
    } else {
	this.spot_light = 0;
    }
    return;
}


LightSource.prototype.setLight = function( gl, program, index ) {
    // Make sure the program is current otherwise switch
    let currProgram = gl.getParameter(gl.CURRENT_PROGRAM);
    if ( currProgram != program ) gl.useProgram( program ); 
    let locLight = -1;
	// Build the uniform name including the array
    let varName = 'lights[' + String(index);
    if ((locLight = gl.getUniformLocation(program, (varName + '].ambient')))!=null)
		gl.uniform4fv(locLight, this.ambient);
    if ((locLight = gl.getUniformLocation(program, (varName  + '].diffuse')))!=null)
		gl.uniform4fv(locLight, this.diffuse);
    if ((locLight = gl.getUniformLocation(program, (varName  + '].specular')))!=null)
    gl.uniform4fv(locLight, this.specular);
    if ((locLight = gl.getUniformLocation(program, (varName  + '].spot_light')))!=null)
		gl.uniform1i(locLight, this.spot_light);
    if ((locLight = gl.getUniformLocation(program, (varName  + '].spot_direction')))!=null)
		gl.uniform3fv(locLight, this.spot_direction);
    if ((locLight = gl.getUniformLocation(program, (varName  + '].spot_exponent')))!=null)
		gl.uniform1f(locLight, this.spot_exponent);
    if ((locLight = gl.getUniformLocation(program, (varName  + '].spot_cutoff')))!=null) {
	let val = Math.PI * this.spot_cutoff / 180.0;
	gl.uniform1f(locLight, val);
    }
    if ((locLight = gl.getUniformLocation(program, (varName  + '].constant_attenuation')))!=null)
		gl.uniform1f(locLight, this.constant_attenuation);
    if ((locLight = gl.getUniformLocation(program, (varName  + '].linear_attenuation')))!=null)
		gl.uniform1f(locLight, this.linear_attenuation);
    if ((locLight = gl.getUniformLocation(program, (varName  + '].quadratic_attenuation')))!=null)
		gl.uniform1f(locLight, this.quadratic_attenuation);
	// switch back if needed
    if ( currProgram != program ) gl.useProgram( currProgram );
    return;
}

  
LightSource.prototype.setPosition = function( gl, program, index ) {
    // Make sure the program is current otherwise switch
    let currProgram = gl.getParameter(gl.CURRENT_PROGRAM);
    if ( currProgram != program ) gl.useProgram( program ); 
    // Build the uniform name including the array
    let varName = 'lightPosition[' + String(index);
    let locLight = gl.getUniformLocation(program, (varName  + ']'));
    // let locLight = gl.getUniformLocation(program, 'lightPosition');
    if (locLight != null)
	gl.uniform4fv(locLight, this.position);
    // switch back if needed
    if ( currProgram != program ) gl.useProgram( currProgram );
    return;
}
