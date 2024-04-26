import * as THREE from 'three';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Create a raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to handle mouse move event
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Function to render the scene
function render() {
    // Update the raycaster with the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections
    const intersects = raycaster.intersectObjects(scene.children);

    // Change cube color if there is an intersection
    if (intersects.length > 0) {
        cube.material.color.set(0xff0000);
    } else {
        cube.material.color.set(0x00ff00);
    }

    // Render the scene
    renderer.render(scene, camera);
}

// Add event listener for mouse move event
window.addEventListener('mousemove', onMouseMove, false);

// Render the scene
function animate() {
    requestAnimationFrame(animate);
    render();
}
animate();