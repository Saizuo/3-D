function createScene(canvasId, modelPath) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector(canvasId),
        alpha: true
    });

    renderer.setSize(500, 500);

    // Different settings for each model
    if (canvasId === '#model1') {
        camera.position.z = 35;
        camera.position.y = 6;     // Lower height
        camera.position.x = -2;    // More to the left
    } else if (canvasId === '#model2') {
        camera.position.z = 45;
        camera.position.y = 8;     // Lower height
        camera.position.x = -3;    // More to the left
    } else if (canvasId === '#model3') {
        camera.position.z = 100;
        camera.position.y = 30;    // Keep height
        camera.position.x = -5;    // More to the left
    }

    camera.rotation.x = -0.2;

    camera.aspect = 500 / 500;
    camera.updateProjectionMatrix();    const controls = new THREE.OrbitControls(camera, renderer.domElement);
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
        if (canvasId === '#model1') {
            model.scale.set(6, 6, 6);
            model.position.x = -5;     // Move up
            model.position.y = -4;      // Move up
        } else if (canvasId === '#model2') {
            model.scale.set(6, 6, 6);
            model.position.x = -5;     // Move up
            model.position.y = 3;      // Move up
        } else if (canvasId === '#model3') {
            model.scale.set(2, 2, 2);
            model.position.x = -10;     // Move up
            model.position.y = 15;     // Move up
        }        model.rotation.y = Math.PI * 0.25;
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