const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewSection = document.querySelector('.preview-section');
const originalPreview = document.getElementById('originalPreview');
const loadingIndicator = document.querySelector('.loading-indicator');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

// Handle dropped files
dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFile(files[0]);
});

// Add at the top with other constants
const chooseFileBtn = document.getElementById('chooseFileBtn');

// Add this event listener
chooseFileBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file.name);
    handleFile(file);
});

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('File loaded successfully');
            originalPreview.src = e.target.result;
            previewSection.style.display = 'block';
            showLoading();
            convertToModel(e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function showLoading() {
    loadingIndicator.style.display = 'block';
}

async function convertToModel(imageData) {
    console.log('Starting conversion process');
    const apiKey = 'mtEmozRWSWMXRoaNyqNE4VM11nPpb127tRpoKd6kblZVCcLNLqC3goiQATjF';
    
    const requestData = {
        key: apiKey,
        image: imageData,
        output_format: 'glb',
        ss_sampling_steps: 50,
        slat_sampling_steps: 50,
        resolution: 512,
        temp: "no"
    };

    try {
        const response = await fetch('https://modelslab.com/api/v6/3d/image_to_3d', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log('API Response:', result);

        if (result.status === 'success') {
            const modelUrl = result.output[0];
            console.log('Loading model from:', modelUrl);
            loadModelIntoPreview(modelUrl);
        }
    } catch (error) {
        console.error('Conversion error:', error);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function loadModelIntoPreview(modelUrl) {
    const canvas = document.getElementById('modelPreview');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);
    
    const loader = new THREE.GLTFLoader();
    loader.load(modelUrl, (gltf) => {
        const model = gltf.scene;
        model.scale.set(10, 10, 10);
        model.position.y = -5;
        scene.add(model);
        
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        camera.position.z = 35;
        camera.position.y = 10;
        
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    });
}function enableDownloadOptions(modelUrl) {
    const formatButtons = document.querySelectorAll('.format-buttons button');
    formatButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.open(modelUrl, '_blank');
        });
    });
}