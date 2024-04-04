import * as THREE from 'three';

export var collisions = [];

export function calculateCollisionPoints(mesh, scale, type = 'collision') {
  var bbox = new THREE.Box3().setFromObject(mesh);

  var bounds = {
    type: type,
    xMin: bbox.min.x,
    xMax: bbox.max.x,
    yMin: bbox.min.y,
    yMax: bbox.max.y,
    zMin: bbox.min.z,
    zMax: bbox.max.z,
  };

  collisions.push(bounds);
}

export function detectCollisions(rotationPoints, camera) {
  var userBox = new THREE.Box3().setFromObject(camera);

  for (var i = 0; i < rotationPoints.length; i++) {
    var rotationPoint = rotationPoints[i];
    var bounds = {
      xMin: userBox.min.x,
      xMax: userBox.max.x,
      yMin: userBox.min.y,
      yMax: userBox.max.y,
      zMin: userBox.min.z,
      zMax: userBox.max.z,
    };

    for (var j = 0; j < collisions.length; j++) {
      if (collisions[j].type === 'collision') {
        if (
          bounds.xMin <= collisions[j].xMax &&
          bounds.xMax >= collisions[j].xMin &&
          bounds.yMin <= collisions[j].yMax &&
          bounds.yMax >= collisions[j].yMin &&
          bounds.zMin <= collisions[j].zMax &&
          bounds.zMax >= collisions[j].zMin
        ) {
          // Collision detected
          // Perform collision response or handle the collision as needed
          console.log('Collision detected with object:', collisions[j]);
          // Adjust the user's position or take other appropriate actions
        }
      }
    }
  }
}