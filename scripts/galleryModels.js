function createScene(canvasId, modelPath) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector(canvasId),
        alpha: true
    });

    renderer.setSize(400, 300);

    // Different settings for each model
    if (canvasId === '#model1') {
        camera.position.z = 25;
        camera.position.y = 6;
    } else if (canvasId === '#model2') {
        camera.position.z = 35;
        camera.position.y = 8;
    } else if (canvasId === '#model3') {
        camera.position.z = 900;  // Much further back
        camera.position.y = 50;   // Higher viewpoint
        camera.position.x = 20;   // Side angle
    }

    camera.rotation.x = -0.3;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.enableZoom = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    const loader = new THREE.GLTFLoader();
    let mixer;

    loader.load(modelPath, function(gltf) {
        const model = gltf.scene;
        if (canvasId === '#model3') {
            model.scale.set(60, 60, 60);  // Much larger scale for car
            model.position.y = -30;       // Lower position
        } else {
            model.scale.set(10, 10, 10);
            model.position.y = -5;
        }
        model.rotation.y = Math.PI * 0.25;
        scene.add(model);

        if (canvasId !== '#model3') {
            mixer = new THREE.AnimationMixer(model);
            const animations = gltf.animations;
            if (animations && animations.length) {
                animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
            }
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        if (mixer) mixer.update(0.016);
        controls.update();
        renderer.render(scene, camera);
    }

    animate();
}
// Initialize three different models
createScene('#model1', 'robot_playground.glb');
createScene('#model2', 'ship_in_a_bottle.glb');
createScene('#model3', 'bunny_doctor.glb', 200, 50, 20);
createScene('#model3', 'bunny_doctor.glb', 200, 50, 20);