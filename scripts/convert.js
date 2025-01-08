const API_KEY = "";

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    // First upload to get URL
    const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_KEY', {
        method: 'POST',
        body: formData
    });
    
    const data = await response.json();
    return data.data.url;
}

async function convert3D(file) {
    const preview = document.querySelector('.preview');
    preview.innerHTML = '<p>Converting image...</p>';
    
    // Create FormData and append the file
    const formData = new FormData();
    formData.append('key', API_KEY);
    formData.append('image', file);
    formData.append('ss_sampling_steps', 50);
    formData.append('slat_sampling_steps', 50);
    formData.append('output_format', 'glb');

    const response = await fetch('https://modelslab.com/api/v6/3d/image_to_3d', {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    return result;
}

function handleFile(file) {
    if (file && file.type.startsWith('image/')) {
        const preview = document.querySelector('.preview');
        preview.innerHTML = '<p>Starting conversion process...</p>';
        
        convert3D(file)
            .then(result => {
                if (result.status === "success") {
                    preview.innerHTML = `
                        <div class="success-container">
                            <h3>Conversion Complete! 🎉</h3>
                            <p>Generation Time: ${result.generationTime}s</p>
                            <div class="model-links">
                                ${result.output.map(url => `
                                    <a href="${url}" class="btn btn-primary" download>
                                        <i class="fas fa-download"></i> Download 3D Model
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    `;
                } else {
                    preview.innerHTML = `
                        <div class="error-container">
                            <p>Conversion failed. Please try again.</p>
                            <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">
                                Try Again
                            </button>
                        </div>
                    `;
                }
            })
            .catch(error => {
                preview.innerHTML = `
                    <div class="error-container">
                        <p>Error: ${error.message}</p>
                        <button class="btn btn-primary" onclick="document.getElementById('fileInput').click()">
                            Try Again
                        </button>
                    </div>
                `;
            });
    }
}
// Add these event listeners to your existing HTML
document.getElementById('dropZone').addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFile(file);
});