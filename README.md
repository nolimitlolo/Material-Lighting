1 Material and Lighting [10 in total]
This assignment is based on the box laboratories with materials and lighting of March 12th, 2020. You should use this code as a start for your WebGL2 solution. (Your solution must be WebGL2 and not use THREE).

2 Spheres [2]
Create a class for modelling a sphere as shown in Fig. 1. You can reuse much of the BoxShape and associated classes from the laboratory. Your sphere should enable drawing with smooth and flat shading. You will need to use two different face lists. You are required to use element draw.
A list of vertex position and an indexed face list are given in the Appendix.

3 Spinning Grid of Spheres [1]
Use the sphere from Question 2 and place them in a 5 × 7 frontoparallel grid. Use one element draw for all the spheres. Use an animation similar to the lab to have all the spheres spinning while using instanced drawing. (Note: If you can’t get the sphere to work, you can use the cubes from the lab).

4 Light Source [3]
Use a single directional light source and a material for the spheres (see also Question 5). Give the user the ability to change the ambient, diffuse and specular light source strength through the dat.gui interface. Please remove the second light source and the options to switch to point or spot light source. Please remove the unecessary light parameters from your javascript and shader code. Calculate the lighting model per fragment.
The user should also be able to change the direction vector of the light source. Control the position of the light sphere with ’a’, ’w’, ’s’ and ’d’ keys.

5 Materials [3]
Add controls for a single material for all spheres. The user should be able to control the emissive, ambient, diffuse and specular colours, as well as the shinniness exponent of the Blinn-Phong (OpenGL hardware) model.
Vary the material for each sphere based on the instance id. The emissive, ambient, diffuse and specular colours should vary in the first four rows of the grid, respectively. Scale the colour
􏰀􏰁
parameters from left to right by scolour = 0.5 0.9 0.95 1 1.05 1.1 1.5 . Make sure to clamp the values of each channel at 1. In the fifth row of the grid vary the shinniness parameter
􏰀􏰁
(exponent) in a logarithmic scale slog = 0.1 0.2 0.5 1 2 5 10 . Add a checkbox in dat.gui to switch between flat and smooth shading.

6 Bonus: Bump Mapping [2]
Add another row of sphere for which you use bump mapping. The heights of the bumps should vary as the colours from left to right.