
import * as THREE from 'three';
import { PointerLockControls } from 'PointerLockControls';
import { collisions } from './collision.js';
import { detectCollisions } from './collision.js';
import { calculateCollisionPoints } from './collision.js';


const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const cameraConfig = {
	fov: 75,
	aspect: window.innerWidth / window.innerHeight,
	near: 0.1,
	far: 1000,
};
const camera = new THREE.PerspectiveCamera(
	cameraConfig.fov,
	cameraConfig.aspect,
	cameraConfig.near,
	cameraConfig.far
);
camera.position.set(0, 4, 0);


const rendererConfig = {
	width: window.innerWidth,
	height: window.innerHeight
};
const renderer = new THREE.WebGLRenderer();
renderer.setSize(rendererConfig.width, rendererConfig.height);
document.body.appendChild(renderer.domElement);


// Create the floor plane
const floorGeometry = new THREE.PlaneGeometry(50, 15); // 15ft wide hallway
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
scene.add(floor);

// Create the large wall planes
const wallGeometry = new THREE.BoxGeometry(50, 12, 2); // 12ft high walls
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide }); // Blue walls

// Create the small wall planes
const endWallGeometry = new THREE.BoxGeometry(2, 12, 15); // 12ft high walls
const endWallMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff, side: THREE.DoubleSide }); // Blue walls

const wallFront = new THREE.Mesh(wallGeometry, wallMaterial);
wallFront.position.z = -7.5; // Position the walls to create a hallway
wallFront.position.y = 6;
let frontWallrotationPoint = new THREE.Vector3(wallFront.x, wallFront.y, wallFront.z);
scene.add(wallFront);

const wallBack = new THREE.Mesh(wallGeometry, wallMaterial);
wallBack.position.z = 7.5; // Position the walls to create a hallway
wallBack.position.y = 6;
let backWallrotationPoint = new THREE.Vector3(wallBack.x, wallBack.y, wallBack.z);
scene.add(wallBack);

const wallLeft = new THREE.Mesh(endWallGeometry, wallMaterial);
wallLeft.geometry.width
wallLeft.position.x = 25; // Position the walls to create a hallway
wallLeft.position.y = 6;
let leftWallrotationPoint = new THREE.Vector3(wallLeft.x, wallLeft.y, wallLeft.z);
scene.add(wallLeft);


const wallRight = new THREE.Mesh(endWallGeometry, wallMaterial);
wallRight.position.x = -25; // Position the walls to create a hallway
wallRight.position.y = 6;
let rightWallrotationPoint = new THREE.Vector3(wallRight.x, wallRight.y, wallRight.z);
scene.add(wallRight);

const userBoxGeometry = new THREE.BoxGeometry(1, 2, 1); // Adjust the size as needed
const userBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false });
const userBox = new THREE.Mesh(userBoxGeometry, userBoxMaterial);
scene.add(userBox);

calculateCollisionPoints(wallFront);
calculateCollisionPoints(wallBack);
calculateCollisionPoints(wallLeft);
calculateCollisionPoints(wallRight);
calculateCollisionPoints(floor);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0x404040, 100);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, cameraConfig.positionY, 0); // Position the light at the camera's POV height
scene.add(pointLight);


const controls = new PointerLockControls(camera, renderer.domElement);
scene.add(camera);
controls.movementSpeed = 1;
controls.lookSpeed = 0.1;

blocker.addEventListener('click', function() {
	controls.lock();
});

controls.addEventListener('lock', function() {
	instructions.style.display = 'none';
	blocker.style.display = 'none';
});

controls.addEventListener('unlock', function() {
	blocker.style.display = 'block';
	instructions.style.display = '';
});

// Add first-person controls
/*const controls = new FirstPersonControls(camera, renderer.domElement);
controls.movementSpeed = 10; // Adjust movement speed as needed
controls.lookSpeed = 0.1; // Adjust look speed as needed
controls.lookVertical = true; // Allow vertical looking*/

// Movement controls
const movement = {
	forward: false,
	backward: false,
	left: false,
	right: false
};

document.addEventListener('keydown', function(event) {
	switch (event.code) {
		case 'ArrowUp':
		case 'KeyW':
			movement.forward = true;
			break;

		case 'ArrowLeft':
		case 'KeyA':
			movement.left = true;
			break;

		case 'ArrowDown':
		case 'KeyS':
			movement.backward = true;
			break;

		case 'ArrowRight':
		case 'KeyD':
			movement.right = true;
			break;
		case 'ShiftLeft':
			movement.fast = true;
			break;
	}
}, false);

document.addEventListener('keyup', function(event) {
	switch (event.code) {
		case 'ArrowUp':
		case 'KeyW':
			movement.forward = false;
			break;

		case 'ArrowLeft':
		case 'KeyA':
			movement.left = false;
			break;

		case 'ArrowDown':
		case 'KeyS':
			movement.backward = false;
			break;

		case 'ArrowRight':
		case 'KeyD':
			movement.right = false;
			break;
		case 'ShiftLeft':
			movement.fast = false;
			break;
	}
}, false);

// Update the controls in the animation loop
const velocity = new THREE.Vector3();
let previousTime = performance.now();
animate();

function animate() {
	requestAnimationFrame(animate);

	const delta = (performance.now() - previousTime) / 1000;

	const moveSpeed = movement.fast ? 6 : 2;



	if (movement.forward) controls.getObject().translateZ(-moveSpeed * delta);
	if (movement.backward) controls.getObject().translateZ(moveSpeed * delta);
	if (movement.left) controls.getObject().translateX(-moveSpeed * delta);
	if (movement.right) controls.getObject().translateX(moveSpeed * delta);

	previousTime = performance.now();

	userBox.position.copy(camera.position);
	
	if (collisions.length > 0) {
    detectCollisions([frontWallrotationPoint, backWallrotationPoint, leftWallrotationPoint, rightWallrotationPoint], camera);
  }
	renderer.render(scene, camera);
}


// Handle window resizing
window.addEventListener('resize', function() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}, false);