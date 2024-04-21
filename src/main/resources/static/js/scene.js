// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, .1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create the room walls, floor, and ceiling
const roomGeometry = new THREE.BoxGeometry(10, 5, 20);
const roomMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
const room = new THREE.Mesh(roomGeometry, roomMaterial);
scene.add(room);

// Create the corkboard
const corkboardGeometry = new THREE.PlaneGeometry(4, 3);
const corkboardMaterial = new THREE.MeshPhongMaterial({ color: 0xd2b48c });
const corkboard = new THREE.Mesh(corkboardGeometry, corkboardMaterial);
corkboard.position.set(0, 1.5, -9.5);
scene.add(corkboard);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 3, 0);
scene.add(pointLight);

// Set up the camera
camera.position.set(0, 2, 5);
camera.lookAt(0, 1.5, 0);

// Render the scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

// Handle window resizing
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

