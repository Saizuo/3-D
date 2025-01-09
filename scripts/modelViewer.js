const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#dinoCanvas'),
    alpha: true
});

renderer.setSize(800, 800);
camera.position.y = 8;  // Move camera up
camera.position.z = 35; // Keep zoomed out
camera.position.x = 4;
camera.rotation.x = -0.3; // Tilt camera downward

// Add OrbitControls for mouse interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enableZoom = true;

const loader = new THREE.GLTFLoader();
let model;

loader.load('painterly_cottage.glb', function(gltf) {
    model = gltf.scene;
    model.scale.set(10, 10, 10);
    model.rotation.y = Math.PI * 0.25; // Initial 45-degree rotation
    scene.add(model);
}, undefined, function(error) {
    console.error(error);
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(0, 1, 1);
scene.add(directionalLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 2);
frontLight.position.set(0, 0, 5);
scene.add(frontLight);

const backLight = new THREE.DirectionalLight(0xffffff, 2);
backLight.position.set(0, 0, -5);
scene.add(backLight);