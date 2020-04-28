// ==========================================================================
// $Id: Material.js,v 1.2 2019/03/09 18:15:33 jlang Exp $
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
// Email:   jlang@eecs.uottawa.ca
// ==========================================================================
// $Log: Material.js,v $
// Revision 1.2  2019/03/09 18:15:33  jlang
// Included solution and starter code.
//
// Revision 1.1  2019/03/08 22:42:42  jlang
// First draft of material lab
//
// ==========================================================================
function Material() {
    this.emissive = glMatrix.vec4.create();
    this.ambient = glMatrix.vec4.fromValues( 0.2, 0.2, 0.2, 1.0 );
    this.diffuse = glMatrix.vec4.fromValues( 0.8, 0.8, 0.8, 1.0 ); 
    this.specular = glMatrix.vec4.fromValues( 0.0, 0.0, 0.0, 1.0 );
    this.shininess = 1.0;
    this.buffer = null;
    this.bufSize = 20; // 20 Floats
};

Material.prototype.setMaterial = function( gl, program, index ) {
    let currProgram = gl.getParameter(gl.CURRENT_PROGRAM);
    if ( currProgram != program ) gl.useProgram( program ); 
    let locMaterial = -1;
    // Build the uniform name including the array
    let varName = 'materials[' + String(index);
    if (( locMaterial = gl.getUniformLocation(program, (varName + "].emissive"))) != null )
	gl.uniform4fv(locMaterial, this.emissive);
    if (( locMaterial = gl.getUniformLocation(program, (varName + "].ambient"))) != null )
	gl.uniform4fv(locMaterial, this.ambient);
    if (( locMaterial = gl.getUniformLocation(program, (varName + "].diffuse"))) != null )
	gl.uniform4fv(locMaterial, this.diffuse);
    if ((locMaterial = gl.getUniformLocation(program, (varName + "].specular"))) != null )
	gl.uniform4fv(locMaterial, this.specular);
    if (( locMaterial = gl.getUniformLocation(program, (varName + "].shininess"))) != null )
	gl.uniform1f(locMaterial, this.shininess);
    // switch back if needed
    if ( currProgram != program ) gl.useProgram( currProgram );
    return;	
}




Material.prototype.setMaterialUBO = function( gl, index, ubo ) {
  if (this.buffer == null ) {
	this.buffer = new Float32Array(this.bufSize);
    }
  // Fill the buffer
  let offset = 0;
  for ( let i=0; i<=4; i++ ) {
    this.buffer[offset+i] = this.emissive[i];
  }
  offset = 4;
  for ( let i=0; i<=4; i++ ) {
    this.buffer[offset+i] = this.ambient[i];
  }
  offset = 8;
  for ( let i=0; i<=4; i++ ) {
    this.buffer[offset+i] = this.diffuse[i];
  }
  offset = 12;
  for ( let i=0; i<=4; i++ ) {
    this.buffer[offset+i] = this.specular[i];
  }
  offset = 16;
  this.buffer[offset] = this.shininess;
  gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
    gl.bufferSubData(gl.UNIFORM_BUFFER, this.bufSize * Float32Array.BYTES_PER_ELEMENT*index, this.buffer );
    // gl.bindBuffer(gl.UNIFORM_BUFFER, 0);
    return;
}

function makeMaterialArray() {
  let matArray = [];
  // material 0 - blue plastic
  let mat = new Material();   
  glMatrix.vec4.set( mat.ambient, 0.02, 0.02, 0.05, 1.0); 
  glMatrix.vec4.set( mat.diffuse, 0.2, 0.2, 0.5, 1.0);
  glMatrix.vec4.set( mat.specular, 0.3, 0.3, 0.3, 1.0); 
  mat.shininess = 1.0;
  matArray.push( mat );
  // material 1 - turquise?
  mat = new Material();   
  glMatrix.vec4.set( mat.ambient, 0.02, 0.05, 0.04, 1.0); 
  glMatrix.vec4.set( mat.diffuse, 0.2, 0.5, 0.4, 1.0); 
  glMatrix.vec4.set( mat.specular, 0.3, 0.4, 0.35, 1.0); 
  mat.shininess = 12.5;
  matArray.push( mat );
  // material 2 - ruby?
  mat = new Material();   
  glMatrix.vec4.set( mat.ambient, 0.06, 0.005, 0.005, 1.0); 
  glMatrix.vec4.set( mat.diffuse, 0.6, 0.05, 0.05, 1.0); 
  glMatrix.vec4.set( mat.specular, 0.35, 0.2, 0.2, 1.0); 
  mat.shininess = 76.5;
  matArray.push( mat );
  // material 3 - jade?
  mat = new Material();   
  glMatrix.vec4.set( mat.ambient, 0.035, 0.045, 0.04, 1.0); 
  glMatrix.vec4.set( mat.diffuse, 0.35, 0.45, 0.4, 1.0); 
  glMatrix.vec4.set( mat.specular, 0.3, 0.3, 0.3, 1.0); 
  mat.shininess = 8;
  matArray.push( mat );  
  return matArray;
}

