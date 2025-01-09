const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#dinoCanvas'),
    alpha: true
});

renderer.setSize(800, 800);
camera.position.z = 27; // Reduce from 35 to zoom in
camera.position.y = 6;  // Adjust height slightly
camera.position.x = 3;  // Adjust side positioncamera.rotation.x = -0.3; // Tilt camera downward

// Add OrbitControls for mouse interaction
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enableZoom = true;

const loader = new THREE.GLTFLoader();
let model;
let mixer;

loader.load('robot_playground.glb', function(gltf) {
    model = gltf.scene;
    model.scale.set(10, 10, 10);
    model.rotation.y = Math.PI * 0.25;
    model.position.y = -5; // This will move the model down
    scene.add(model);
    
    // Animation code
    mixer = new THREE.AnimationMixer(model);
    const animations = gltf.animations;
    if (animations && animations.length) {
        animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });
    }
}, undefined, function(error) {
    console.error(error);
});

function animate() {
    requestAnimationFrame(animate);
    if (mixer) {
        mixer.update(0.016); // Update animations (roughly 60fps)
    }
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