import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

function init3DScene() {
    const modelViewer = document.getElementById('model-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, modelViewer.clientWidth / modelViewer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(modelViewer.clientWidth, modelViewer.clientHeight);
    modelViewer.appendChild(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load('dino.glb', function(gltf) {
        const model = gltf.scene;
        scene.add(model);
        
        // Auto-center and scale the model
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        camera.position.z = Math.max(size.x, size.y, size.z) * 2;
    });

    // Add lights
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = modelViewer.clientWidth / modelViewer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(modelViewer.clientWidth, modelViewer.clientHeight);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init3DScene);
