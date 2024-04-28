import * as THREE from './three.module.js';
import Stats from './stats.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Octree } from './Octree.js';
import { OctreeHelper } from './OctreeHelper.js';
import { Capsule } from './Capsule.js';
import { GUI } from './lil-gui.module.min.js';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

// Import necessary modules and libraries

// Get the container element
const container = document.getElementById('container');

let dataItems = [];
let dataItem;
let contentShown = false;

// -------------------------------Scene Setup--------------------------------

// Create a clock for timing
const clock = new THREE.Clock();

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccee);
scene.fog = new THREE.Fog(0x88ccee, 0, 50);

// Create the camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

camera.position.set(0, 0, -10);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Set the camera up and down looking limits
const maxUpAngle = Math.PI / 2; // Maximum angle to look up
const maxDownAngle = Math.PI / 2; // Maximum angle to look down

// Function to limit the camera rotation
function limitCameraRotation() {
	const upAngle = Math.max(-maxUpAngle, Math.min(maxDownAngle, camera.rotation.x));
	camera.rotation.x = upAngle;
}



// Add event listener for mouse movement

// -------------------------------Lighting Setup--------------------------------

// Create fill light
const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 1.5);
fillLight1.position.set(2, 1, 1);
scene.add(fillLight1);

// Create directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(-5, 25, -1);
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 0.01;
directionalLight.shadow.camera.far = 500;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.radius = 4;
directionalLight.shadow.bias = -0.00006;
scene.add(directionalLight);

// -------------------------------Renderer Setup--------------------------------

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
if(container.child !== renderer.domElement) {
	container.appendChild(renderer.domElement);
} 


// -------------------------------Stats Setup--------------------------------

const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild(stats.domElement);

// -------------------------------Physics Constants--------------------------------

const GRAVITY = 30;

const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.09;

const STEPS_PER_FRAME = 5;

const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

const spheres = [];
let sphereIdx = 0;

for (let i = 0; i < NUM_SPHERES; i++) {
	const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	sphere.castShadow = true;
	sphere.receiveShadow = true;
	scene.add(sphere);

	spheres.push({
		mesh: sphere,
		collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), SPHERE_RADIUS),
		velocity: new THREE.Vector3(),
	});
}

// -------------------------------Physics Setup--------------------------------
const worldOctree = new Octree();

const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

// -------------------------------Raycast Setup--------------------------------

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

function onMouseMove(event) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	if (document.pointerLockElement === document.body) {
		camera.rotation.y -= event.movementX / 500;
		camera.rotation.x -= event.movementY / 500;
	}

	limitCameraRotation();
}


const raycasterLineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // red color
let raycasterLine; // this will hold the line
let raycastTarget = null;
function raycast() {
	// Set the raycaster to always cast from the center of the screen
	raycaster.setFromCamera({ x: 0, y: 0 }, camera);

	const intersects = raycaster.intersectObjects(scene.children, true);
	if (intersects.length > 0) {
		const intersection = intersects[0];

		// Create a new line from a point slightly in front of the camera to the intersection point
		const startPoint = new THREE.Vector3().copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(2));
		const raycasterLineGeometry = new THREE.BufferGeometry().setFromPoints([startPoint, intersection.point]);
		raycasterLine = new THREE.Line(raycasterLineGeometry, raycasterLineMaterial);
		// scene.add(raycasterLine);
	}

}

document.addEventListener('mousemove', onMouseMove);

const startButton = document.getElementById('startButton');
let gameStarted = false;
startButton.addEventListener('click', function () {

	if (document.body.requestPointerLock) {
		document.body.requestPointerLock();
		menu.style.display = 'none';
		container.appendChild(crosshair);
		console.log("Start Game Button Clicked!");
	}
	gameStarted = true;
});


// -------------------------------Player Movement Functions--------------------------------

function getForwardVector() {
	camera.getWorldDirection(playerDirection);
	playerDirection.y = 0;
	playerDirection.normalize();
	return playerDirection;
}

function getSideVector() {
	camera.getWorldDirection(playerDirection);
	playerDirection.y = 0;
	playerDirection.normalize();
	playerDirection.cross(camera.up);
	return playerDirection;
}

// -------------------------------Crosshair Setup--------------------------------

// Create a div element for the crosshair
const crosshair = document.createElement('div');
crosshair.style.position = 'absolute';
crosshair.style.top = '50%';
crosshair.style.left = '50%';
crosshair.style.transform = 'translate(-50%, -50%)';
crosshair.style.width = '2px';
crosshair.style.height = '2px';
crosshair.style.background = 'red';
crosshair.style.borderRadius = '50%';
crosshair.style.zIndex = '1'; // Ensure it's above other elements


// -------------------------------Player Controls--------------------------------

const keyStates = {};

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

document.addEventListener('keydown', (event) => {
	keyStates[event.code] = true;
});

document.addEventListener('keyup', (event) => {
	keyStates[event.code] = false;
});

document.addEventListener('mousedown', () => {
	mouseTime = performance.now();
	console.log('Mouse down!');


	if (document.body.requestPointerLock && gameStarted === true) {
		document.body.requestPointerLock();
	}

	// Calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	const mouse = new THREE.Vector2();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


	// Update the picking ray with the camera and mouse position
	if (contentShown === false) {
		raycaster.setFromCamera(mouse, camera);
		console.log("contentShown right before raycast:" + contentShown)
		raycast();
	}

	// Calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(scene.children);

	for (let i = 0; i < intersects.length && contentShown !== true; i++) {
		if (intersects[i].object === addButton) {
			raycastTarget = intersects[i].object;
			pressButton(intersects[i].object);
			raycastTarget.userData.isPressed = true;
			fetchTemplate('add-picture.html');
			// Button was clicked, perform action
			console.log('Add Button clicked!');
			// Add your button click logic here
		}
		if (intersects[i].object === updateButton) {
			raycastTarget = intersects[i].object;
			pressButton(intersects[i].object);
			raycastTarget.userData.isPressed = true;
			fetchTemplate('login.html');
			// Button was clicked, perform action
			console.log('Update Button clicked!');
			// Add your button click logic here
		}
		if (intersects[i].object === deleteButton) {
			raycastTarget = intersects[i].object;
			pressButton(intersects[i].object);
			raycastTarget.userData.isPressed = true;
			fetchTemplate('delete.html');
			// Button was clicked, perform action
			console.log('Delete Button clicked!');
			// Add your button click logic here
		}

	}
});

document.addEventListener('mouseup', () => {
	// if (document.pointerLockElement !== null) throwBall();
	console.log('Mouse up!');
	console.log(raycastTarget);
	if (raycastTarget) {

		unpressButton(raycastTarget);
		raycastTarget = null;
	}
	console.log("Game Started: " + gameStarted);
});

document.body.addEventListener('mousemove', (event) => {
	if (document.pointerLockElement === document.body) {
		camera.rotation.y -= event.movementX / 500;
		camera.rotation.x -= event.movementY / 500;
	}
});


document.addEventListener('keydown', (event) => {
	if (event.code === 'Escape') {
		menu.style.display = 'flex';
		gameStarted = false;
		// Disable controls
		keyStates['KeyW'] = false;
		keyStates['KeyS'] = false;
		keyStates['KeyA'] = false;
		keyStates['KeyD'] = false;
		keyStates['Space'] = false;
		// Show menu
		console.log('Escape key pressed!');

	}
});

function controls(deltaTime) {
	// gives a bit of air control
	const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

	if (keyStates['KeyW']) {
		playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
	}

	if (keyStates['KeyS']) {
		playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta));
	}

	if (keyStates['KeyA']) {
		playerVelocity.add(getSideVector().multiplyScalar(-speedDelta));
	}

	if (keyStates['KeyD']) {
		playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
	}

	if (playerOnFloor) {
		if (keyStates['Space']) {
			playerVelocity.y = 9;
		}
	}
}


// -------------------------------Window Resize-------------------------------

window.addEventListener('resize', onWindowResize);

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

// -------------------------------CRUD Button Setup---------------------------

const geometry = new THREE.BoxGeometry(0.25, 0.25, 0.1); // Button geometry
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Button material
const addButton = new THREE.Mesh(geometry, material); // Create the button mesh
const updateButton = new THREE.Mesh(geometry, material); // Create the button mesh
const deleteButton = new THREE.Mesh(geometry, material); // Create the button mesh

addButton.position.set(-3.2, -3.6, 5.2); // Set button position
updateButton.position.set(-3.2, -4, 5.2); // Set button position
deleteButton.position.set(-3.2, -4.4, 5.2); // Set button position

addButton.userData.isCRUDButton = true;
updateButton.userData.isCRUDButton = true;
deleteButton.userData.isCRUDButton = true;

addButton.userData.isPressed = false;
updateButton.userData.isPressed = false;
deleteButton.userData.isPressed = false;

scene.add(addButton); // Add button to the scene
scene.add(updateButton); // Add button to the scene
scene.add(deleteButton); // Add button to the scene


// -------------------------------Button Press Setup--------------------------------

// Function to create a glowing material
function createGlowingMaterial(color, intensity) {
	return new THREE.MeshStandardMaterial({
		color: color,
		emissive: color,
		emissiveIntensity: intensity,
		transparent: true,
		opacity: 0.8
	});
}

// Create glowing green material
const glowingGreenMaterial = createGlowingMaterial(0x00ff00, 0.5);

// Apply the glowing green material to the buttons
addButton.material = glowingGreenMaterial;
updateButton.material = glowingGreenMaterial;
deleteButton.material = glowingGreenMaterial;

// Function to depress a button
function pressButton(button) {
	button.position.z += button.geometry.parameters.height / 2; // Depress half the height
}

function unpressButton(button) {
	button.position.z -= button.geometry.parameters.height / 2; // Depress half the height
	document.exitPointerLock();
}

const dynamicContent = document.getElementById('dynamicContent');
function fetchTemplate(templateName) {
	const url = `http://localhost:8080/templates/${templateName}`;
	fetch(url)
		.then(response => response.text())
		.then(html => {
			dynamicContent.src = url;
			showDynamicContent();
		})
		.catch((error) => {
			console.error('Error:', error);
		});
	console.log('Template fetched!');
	console.log(`http://localhost:8080/templates/${templateName}`);
}

function showDynamicContent() {
	dynamicContent.style.display = 'flex';
	exitButton.style.display = 'flex';
	contentShown = true;
	if (contentShown === true) {
		keyStates['KeyW'] = false;
		keyStates['KeyS'] = false;
		keyStates['KeyA'] = false;
		keyStates['KeyD'] = false;
		keyStates['Space'] = false;
		gameStarted = false;
	}
}


function hideDynamicContent() {
	dynamicContent.style.display = 'none';
	exitButton.style.display = 'none';
	document.body.requestPointerLock();
	contentShown = false;
	gameStarted = true;
}


const exitButton = document.getElementById('exitDCButton');
console.log("Created exit button: " + exitButton)
exitButton.addEventListener('click', function () {
	hideDynamicContent();
	console.log('Exit Button clicked!');
});






// -------------------------------Text Label Setup--------------------------------

// Function to create a text label for a button
function createTextLabel(text, position) {
	const loader = new FontLoader();

	// Load a font
	loader.load('./fonts/helvetiker_regular.typeface.json', function (font) {

		const textGeometry = new TextGeometry(text, {
			font: font,
			size: 0.1,
			depth: -0.01,
		});

		const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const mesh = new THREE.Mesh(textGeometry, textMaterial);

		// Position the text above the button
		mesh.position.copy(position);

		mesh.rotation.y = Math.PI;
		mesh.position.x += -0.2;
		mesh.position.y += -0.529;

		scene.add(mesh);
	});
}

// Position the labels above the buttons
createTextLabel('Add', new THREE.Vector3(addButton.position.x, addButton.position.y + 0.5, addButton.position.z));
createTextLabel('Update', new THREE.Vector3(updateButton.position.x, updateButton.position.y + 0.5, updateButton.position.z));
createTextLabel('Delete', new THREE.Vector3(deleteButton.position.x, deleteButton.position.y + 0.5, deleteButton.position.z));

// -------------------------------Throw Spheres Functions--------------------------------

function throwBall() {
	const sphere = spheres[sphereIdx];
	camera.getWorldDirection(playerDirection);
	sphere.collider.center.copy(playerCollider.end).addScaledVector(playerDirection, playerCollider.radius * 1.5);

	// throw the ball with more force if we hold the button longer, and if we move forward
	const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));
	sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
	sphere.velocity.addScaledVector(playerVelocity, 2);
	sphereIdx = (sphereIdx + 1) % spheres.length;
}

// -------------------------------Player Collision Functions--------------------------------

function playerCollisions() {
	const result = worldOctree.capsuleIntersect(playerCollider);
	playerOnFloor = false;

	if (result) {
		playerOnFloor = result.normal.y > -5;

		if (!playerOnFloor) {
			playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
		}

		// Translate the player's collider and position
		const translation = result.normal.multiplyScalar(result.depth);
		playerCollider.translate(translation);
		camera.position.add(translation);
	}
}

function updatePlayer(deltaTime) {
	let damping = Math.exp(-4 * deltaTime) - 1;

	if (!playerOnFloor) {
		playerVelocity.y -= GRAVITY * deltaTime;
		// small air resistance
		damping *= 0.1;
	}

	playerVelocity.addScaledVector(playerVelocity, damping);
	playerCollisions();

	const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
	playerCollider.translate(deltaPosition);
	camera.position.copy(playerCollider.end);
}

// -------------------------------Player-Sphere Collision Functions--------------------------------

/*
function playerSphereCollision(sphere) {
	const center = vector1.addVectors(playerCollider.start, playerCollider.end).multiplyScalar(0.5);
	const sphere_center = sphere.collider.center;
	const r = playerCollider.radius + sphere.collider.radius;
	const r2 = r * r;

	// approximation: player = 3 spheres
	for (const point of [playerCollider.start, playerCollider.end, center]) {
		const d2 = point.distanceToSquared(sphere_center);

		if (d2 < r2) {
			const normal = vector1.subVectors(point, sphere_center).normalize();
			const v1 = vector2.copy(normal).multiplyScalar(normal.dot(playerVelocity));
			const v2 = vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity));

			playerVelocity.add(v2).sub(v1);
			sphere.velocity.add(v1).sub(v2);

			const d = (r - Math.sqrt(d2)) / 2;
			sphere_center.addScaledVector(normal, -d);
		}
	}
}
*/

// -------------------------------Sphere Collision Functions--------------------------------

function spheresCollisions() {
	for (let i = 0, length = spheres.length; i < length; i++) {
		const s1 = spheres[i];

		for (let j = i + 1; j < length; j++) {
			const s2 = spheres[j];
			const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
			const r = s1.collider.radius + s2.collider.radius;
			const r2 = r * r;

			if (d2 < r2) {
				const normal = vector1.subVectors(s1.collider.center, s2.collider.center).normalize();
				const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity));
				const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity));

				s1.velocity.add(v2).sub(v1);
				s2.velocity.add(v1).sub(v2);

				const d = (r - Math.sqrt(d2)) / 2;

				s1.collider.center.addScaledVector(normal, d);
				s2.collider.center.addScaledVector(normal, -d);
			}
		}
	}
}

function updateSpheres(deltaTime) {
	spheres.forEach((sphere) => {
		sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);
		const result = worldOctree.sphereIntersect(sphere.collider);

		if (result) {
			sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5);
			sphere.collider.center.add(result.normal.multiplyScalar(result.depth));
		} else {
			sphere.velocity.y -= GRAVITY * deltaTime;
		}

		const damping = Math.exp(-1.5 * deltaTime) - 1;
		sphere.velocity.addScaledVector(sphere.velocity, damping);

		//playerSphereCollision(sphere);
	});

	spheresCollisions();

	for (const sphere of spheres) {
		sphere.mesh.position.copy(sphere.collider.center);
	}
}

// -------------------------------Load 3D World Model--------------------------------

const loader = new GLTFLoader().setPath('../models/glb/');

loader.load('Room.glb', (gltf) => {
	gltf.scene.position.y -= 5;
	scene.add(gltf.scene);

	worldOctree.fromGraphNode(gltf.scene);

	gltf.scene.traverse((child) => {
		if (child.isMesh) {
			child.castShadow = true;
			child.receiveShadow = true;

			if (child.material.map) {
				child.material.map.anisotropy = 4;
			}
		}
	});

	const helper = new OctreeHelper(worldOctree);
	helper.visible = false;
	scene.add(helper);

	const gui = new GUI({ width: 200 });
	gui.add({ debug: false }, 'debug').onChange(function (value) {
		helper.visible = value;
	});

	animate();
});

// -------------------------------Teleport Player when OOB--------------------------------

function teleportPlayerIfOob() {
	if (camera.position.y <= -25) {
		playerCollider.start.set(0, 0.35, 0);
		playerCollider.end.set(0, 1, 0);
		playerCollider.radius = 0.35;
		camera.position.copy(playerCollider.end);
		camera.rotation.set(0, Math.PI, 0);
		console.log('Player teleported!');
	}
}

// -------------------------------Animate Scene Function--------------------------------

function animate() {
	const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

	// we look for collisions in substeps to mitigate the risk of
	// an object traversing another too quickly for detection.
	for (let i = 0; i < STEPS_PER_FRAME; i++) {
		controls(deltaTime);
		updatePlayer(deltaTime);
		updateSpheres(deltaTime);
		teleportPlayerIfOob();
	}

	renderer.render(scene, camera);
	stats.update();
	requestAnimationFrame(animate);
}

// -------------------------------Database Access Setup--------------------------------


const fileInput = document.getElementById('selectedImage');
const uploadButton = document.getElementById('uploadImageButton');
let fileNameInput = document.getElementById('fileName');

if(contentShown === true) {
	fileInput.addEventListener('change', (event) => {
		const file = event.target.files[0];
		if (file) {
			console.log("File selected:", file.name);
			uploadButton.disabled = false; // Enable the upload button when file is selected
		} else {
			uploadButton.disabled = true; // Disable the upload button if no file is selected
		}
	});

	uploadButton.addEventListener('click', (event) => {
		event.preventDefault(); // Prevent the default form submission
		uploadImage();
	});
}





function uploadImage() {
	console.log("uploadImage() called");
    const file = fileInput.files[0];
	console.log(fileInput.files[0]);
    if (!file) {
        console.error('No file selected.');
        return;
    }	
	console.log(fileName)

    const formData = new FormData();
    formData.append('file', file);
	formData.append('fileName', fileNameInput.value);
    formData.append('fileType', file.fileType);
    formData.append('fileSize', file.size);

    fetch('/add', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getFile(fileName) {
    fetch(`http://localhost:8080/getFileByFileName/${fileName}`, {
        method: 'GET'
    })
    .then(response => response.blob())
    .then(image => {
        const imageLocalURL = URL.createObjectURL(image);
        const imgElement = document.createElement('img');
        imgElement.src = imageLocalURL;
        document.body.appendChild(imgElement);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



// -------------------------------End of File--------------------------------