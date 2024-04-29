import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { Octree } from './Octree.js';
import { OctreeHelper } from './OctreeHelper.js';
import { Capsule } from './Capsule.js';
import { GUI } from './lil-gui.module.min.js';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';

// Get the container element
const container = document.getElementById('container');
let contentShown = false;

// -------------------------------Scene Setup--------------------------------

// Create a clock for timing
const clock = new THREE.Clock();

// Create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccee);
scene.fog = new THREE.Fog(0x88ccee, 0, 50);

// Create the camera
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);
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


// ------------------------------NIGHT MODE----------------------------

function createNightSky() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(1000) + 500;
        const z = THREE.MathUtils.randFloatSpread(2000);

        // Calculate the distance from the star to the center of the room
        const distance = Math.sqrt(x * x + y * y + z * z);

        // If the distance is less than 50 units, adjust the star's position
        if (distance < 50) {
            // Calculate the direction from the center of the room to the star
            const direction = new THREE.Vector3(x, y, z).normalize();

            // Set the star's position to be at least 50 units away from the center of the room
            const newPosition = direction.multiplyScalar(50);
            starVertices.push(newPosition.x, newPosition.y, newPosition.z);
        } else {
            starVertices.push(x, y, z);
        }
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.name = 'stars';
    scene.add(stars);
}

function createMoon() {
    const moonGeometry = new THREE.SphereGeometry(6, 64, 64);
    const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0xffffff,
        emissiveIntensity: 5 });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(75, 100, 75);
    moon.name = 'moon';
	scene.add(moon);

	const moonLight = new THREE.PointLight(0xffffff, 1, 200);
    moonLight.position.copy(moon.position);
    scene.add(moonLight);
}

const nightBackgroundColor = new THREE.Color(0x000000);
const nightFogColor = new THREE.Color(0x000000);

let isNightScene = false;

function toggleDayNight() {
    if (isNightScene) {
        // Switch to day scene
        scene.background = new THREE.Color(0x88ccee);
        scene.fog = new THREE.Fog(0x88ccee, 0, 5000);
        scene.remove(scene.getObjectByName('stars'));
        scene.remove(scene.getObjectByName('moon'));
		scene.remove(wallLight1);
    	scene.remove(wallLight1.target);
		scene.remove(wallLight2);
    	scene.remove(wallLight2.target);
    } else {
        // Switch to night scene
        scene.background = nightBackgroundColor;
        scene.fog = new THREE.Fog(nightFogColor, 0, 500);
		scene.add(wallLight1);
    	scene.add(wallLight1.target);
		scene.add(wallLight2);
    	scene.add(wallLight2.target);
        createNightSky();
        createMoon();
    }
    isNightScene = !isNightScene;
}

const toggleButton = document.getElementById('toggleButton');
        toggleButton.addEventListener('click', () => {
            toggleDayNight();
        });

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

const wallLight1 = new THREE.SpotLight(0xffffff, 3, 100);
wallLight1.position.set(-1.9, -1, 3);
wallLight1.target.position.set(-1, -3, 5.2);
wallLight1.angle = Math.PI / 4;
wallLight1.penumbra = 0.5;
wallLight1.castShadow = true;
scene.add(wallLight1);
scene.add(wallLight1.target);


const wallLight2 = new THREE.SpotLight(0xffffff, 3, 100);
wallLight2.position.set(2.5, -1, 3);
wallLight2.target.position.set(2, -3, 5.2);
wallLight2.angle = Math.PI / 4;
wallLight2.penumbra = 0.5;
wallLight2.castShadow = true;
scene.add(wallLight2);
scene.add(wallLight2.target);
// -------------------------------Renderer Setup--------------------------------

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
if (container.child !== renderer.domElement) {
	container.appendChild(renderer.domElement);
}


// -------------------------------Physics Constants--------------------------------
const GRAVITY = 30;
const STEPS_PER_FRAME = 5;

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

document.addEventListener('mousedown', (event) => {
    mouseTime = performance.now();
    console.log('Mouse down!');

    if (document.body.requestPointerLock && gameStarted === true) {
        document.body.requestPointerLock();
    }

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    if (contentShown === false) {
        raycaster.setFromCamera(mouse, camera);
        console.log("contentShown right before raycast:" + contentShown)
        raycast();
    }

    const intersects = raycaster.intersectObjects(scene.children);

    for (let i = 0; i < intersects.length && contentShown !== true; i++) {
        if (intersects[i].object === addButton) {
            raycastTarget = intersects[i].object;
            pressButton(intersects[i].object);
            raycastTarget.userData.isPressed = true;
            fetchTemplate('add'); // Assuming 'index' corresponds to 'add-picture.html'
            console.log('Add Button clicked!');
        }
        if (intersects[i].object === updateButton) {
            raycastTarget = intersects[i].object;
            pressButton(intersects[i].object);
            raycastTarget.userData.isPressed = true;
            fetchTemplate('list-images'); // Corresponds to 'list-images.html'
            console.log('See All Button clicked!');
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

addButton.position.set(-3.2, -3.9, 5.2); // Set button position
updateButton.position.set(-3.2, -4.3, 5.2); // Set button position

addButton.userData.isCRUDButton = true;
updateButton.userData.isCRUDButton = true;

addButton.userData.isPressed = false;
updateButton.userData.isPressed = false;

scene.add(addButton); // Add button to the scene
scene.add(updateButton); // Add button to the scene


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

// Function to depress a button
function pressButton(button) {
	button.position.z += button.geometry.parameters.height / 2; // Depress half the height
}

function unpressButton(button) {
	button.position.z -= button.geometry.parameters.height / 2; // Depress half the height
	document.exitPointerLock();
}

const dynamicContentContainer = document.getElementById('dcContainer');

function fetchTemplate(type) {
    const iframe = document.getElementById('dynamicContent');
    const url = `http://localhost:8080/getIframeContent?type=${type}`;
    iframe.src = url;

    console.log(`Iframe src set to fetch content for url: ${url}`);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            iframe.srcdoc = html; // Set the iframe content directly
            showDynamicContent();
            console.log(`Iframe updated to show content for type: ${type}`);
        })
        .catch(error => {
            console.error('Error fetching template:', error);
            hideDynamicContent();
            iframe.srcdoc = ''; // Clear the iframe content
        });

    console.log('Template fetch initiated:', url);
}

function showDynamicContent() {
	dynamicContentContainer.style.display = 'flex';
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
	dynamicContentContainer.style.display = 'none';
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
createTextLabel('See All', new THREE.Vector3(updateButton.position.x, updateButton.position.y + 0.5, updateButton.position.z));


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
		teleportPlayerIfOob();
	}

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

// -------------------------------Database Access Setup--------------------------------


const fileInput = document.getElementById('selectedImage');
const uploadButton = document.getElementById('uploadImageButton');
let fileNameInput = document.getElementById('fileName');

if (contentShown === true) {
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




// -------------------------------End of File--------------------------------