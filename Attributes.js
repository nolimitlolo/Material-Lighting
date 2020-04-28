// ==========================================================================
// $Id: Attributes.js,v 1.1 2019/03/08 22:42:40 jlang Exp $
// Attributes class to be used for shapes to create Float32Arrays 
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
// Creator: jlang (Jochen Lang)
// Email:   jlang@eecs.uottawa.ca
// ==========================================================================
// $Log: Attributes.js,v $
// Revision 1.1  2019/03/08 22:42:40  jlang
// First draft of material lab
//
// Revision 1.2  2019/03/07 02:50:00  jlang
// Working dat.gui and basic lighting
//
// Revision 1.1  2019/03/04 03:31:16  jlang
// Initial draft. No lighting yet.
//
// Revision 1.3  2019/02/27 22:26:52  jlang
// Complete example with element-based instanced rendering
//
// Revision 1.2  2019/02/27 03:10:37  jlang
// Element-based drawing
//
// Revision 1.1  2019/02/19 22:17:06  jlang
// Intial (incomplete) boxes laboratory.
//
// Revision 1.2  2019/02/14 0
// ==========================================================================

// Constructor
function Attributes(nColors,nTfms, ... minmax) { 
  this._minP = glMatrix.vec3.fromValues(-1.0,-1.0,-1.0);
  this._maxP = glMatrix.vec3.fromValues(1.0,1.0,1.0);	
  if ( minmax.length >= 1 ) {
	  if ( minmax[0] instanceof Float32Array ) {
		glMatrix.vec3.copy(this._minP, minmax[0]);
	  }
	  if ( minmax.length >= 2 && minmax[1] instanceof Float32Array ) {
		glMatrix.vec3.copy(this._maxP, minmax[1]);
	  }
  }
  this.colors = null; 
  this.tfms = null;
  this.updateColors(nColors);
  this.updateTransforms(nTfms);
}


// Call to change colors
Attributes.prototype.updateColors = function( nColors ) {
  // create a jet color map
  this.colors = new Float32Array(3*nColors);  	

  let step = nColors/4;
  if ( nColors%8 != 0 ) {
      step = 2*Math.ceil(nColors/8.0);
  }
  let step2 = step/2;

  for (let i = 0; i < 35 ; i++ ) {
    this.colors[3*i] = 1.0;
    this.colors[3*i+1] = 1.0;
    this.colors[3*i+2] = 0.0;
  }
  return;
}

// Call to change viewing volume
// minmax must be two Float32Array as created by gl.Matrix.vec3 
// specifying the minimum and maximum of the volume
Attributes.prototype.updateTransforms = function( nTfms, ... minmax) {
  if ( minmax.length >= 1 ) {
	  if ( minmax[0] instanceof Float32Array ) {
		glMatrix.vec3.copy(this._minP, minmax[0]);
	  }
	  if ( minmax.length >= 2 && minmax[1] instanceof Float32Array ) {
		glMatrix.vec3.copy(this._maxP, minmax[1]);
	  }
  }
  if ( this.tfms == null || nTfms != this.tfms.length / 16 ) {
	this.tfms = new Float32Array(16*nTfms);
  }
  let volume = glMatrix.vec3.create();
  glMatrix.vec3.subtract(volume,this._maxP,this._minP);
  let center = glMatrix.vec3.create();
  glMatrix.vec3.add(center,this._maxP,this._minP);
  glMatrix.vec3.scale(center,center,0.5);
  let randVec = glMatrix.vec3.create();
  var len2 = 0.0;
  let m4 = glMatrix.mat4.create();
  var cc = 0.14;
  var pg = 0.15;
  var rw = 0;
  for (let i=0; i<nTfms; i++) {
    // make a unit vector
    do {
      glMatrix.vec3.set(randVec, 2.0*Math.random()-1.0,
			2.0*Math.random()-1.0,
			2.0*Math.random()-1.0);
      len2 = glMatrix.vec3.sqrLen(randVec); 
    } while ( len2 > 1.0 );
    // Now normalize
    glMatrix.vec3.scale( randVec, randVec, 1.0/Math.sqrt(len2));
    // random angle -pi .. pi
    let angle = Math.PI * ( 2.0 * (0.5) -  1.0 );
    // Set the rotation matrix
      glMatrix.mat4.fromRotation(m4, angle, randVec );
    // Add a random vector scaled upto the viewing volume
    m4[12] = ((cc)-0.5) * volume[0] + center[0];
    m4[13] = ((pg)-0.5) * volume[1] + center[1];
    m4[14] = (Math.random()-0.5) * volume[2] + center[2];
    // Copy the matrix into the float buffer for transforms
    for ( let j=0; j<16; j++) {
      this.tfms[i*16+j] = m4[j];
    }
    cc = cc + 0.12;
    rw += 1;
    if (rw == 7){
      pg = pg + 0.175;
      cc = 0.14;
      rw = 0;
    }
  }
  
  return;
}
