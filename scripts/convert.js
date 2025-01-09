const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const previewSection = document.querySelector(".preview-section");
const originalPreview = document.getElementById("originalPreview");
const loadingIndicator = document.querySelector(".loading-indicator");

console.log("Initial elements loaded:", {
  dropZone,
  fileInput,
  previewSection,
  originalPreview,
  loadingIndicator,
});

if (dropZone) {
  // Prevent default drag behaviors
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
    console.log(`Event listener '${eventName}' added to dropZone and body`);
  });

  // Handle dropped files
  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    console.log("Files dropped:", files);
    handleFile(files[0]);
  });
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
  console.log("Default prevented for event:", e.type);
}

// Add at the top with other constants
const chooseFileBtn = document.getElementById("chooseFileBtn");
console.log("Choose file button loaded:", chooseFileBtn);

// Add this event listener
if (chooseFileBtn && fileInput) {
  chooseFileBtn.addEventListener("click", () => {
    console.log("Choose file button clicked");
    fileInput.click();
  });
}

if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    console.log("File selected:", file);
    console.log("File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified),
    });
    handleFile(file);
  });
}

function handleFile(file) {
  console.log("Handling file:", file);
  if (file && file.type.startsWith("image/")) {
    console.log("Valid image file detected");
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("File loaded successfully");
      console.log("FileReader result length:", e.target.result.length);
      originalPreview.src = e.target.result;
      previewSection.style.display = "block";
      showLoading();
      convertToModel(e.target.result);
    };
    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };
    reader.readAsDataURL(file);
  } else {
    console.warn("Invalid file type:", file ? file.type : "no file provided");
  }
}

function showLoading() {
  console.log("Showing loading indicator");
  loadingIndicator.style.display = "block";
}

async function convertToModel(imageData) {
  console.log("Starting conversion process");
  const apiKey = "mtEmozRWSWMXRoaNyqNE4VM11nPpb127tRpoKd6kblZVCcLNLqC3goiQATjF";
  const imgbbApiKey = "57373c61b5347fae87054e8f385fe92b";

  try {
    // Upload to ImgBB (existing code)
    const base64Image = imageData.split(",")[1];
    const formData = new FormData();
    formData.append("key", imgbbApiKey);
    formData.append("image", base64Image);

    console.log("Uploading image to ImgBB...");
    const uploadResponse = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const uploadResult = await uploadResponse.json();
    if (!uploadResult.success) {
      throw new Error("Failed to upload image");
    }

    const imageUrl = uploadResult.data.url;
    console.log("Image uploaded successfully:", imageUrl);

    // Initial API request
    const requestData = {
      key: apiKey,
      image: imageUrl,
      output_format: "glb",
      ss_sampling_steps: 50,
      slat_sampling_steps: 50,
      resolution: 512,
      temp: "no",
    };

    console.log("Sending initial API request...");
    const response = await fetch(
      "https://modelslab.com/api/v6/3d/image_to_3d",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      }
    );

    const result = await response.json();
    console.log("Initial API Response:", result);

    if (result.status === "processing") {
      console.log("Processing started, initiating polling...");
      const modelUrl = await pollForCompletion(result.fetch_result, result.eta);
      if (modelUrl) {
        await validateAndLoadModel(modelUrl);
      }
    } else if (result.status === "success") {
      const modelUrl = result.output[0];
      await validateAndLoadModel(modelUrl);
    } else {
      console.error("Unexpected API response status:", result.status);
      throw new Error(`Unexpected status: ${result.status}`);
    }
  } catch (error) {
    console.error("Conversion error:", error);
    console.error("Error stack:", error.stack);
  } finally {
    console.log("Hiding loading indicator");
    loadingIndicator.style.display = "none";
  }
}

async function pollForCompletion(fetchUrl, initialEta) {
  console.log("Starting polling with initial ETA:", initialEta);
  const maxAttempts = 30; // Maximum number of polling attempts
  let attempts = 0;
  let delay = Math.max(initialEta * 1000, 2000); // Convert ETA to milliseconds, minimum 2 seconds

  while (attempts < maxAttempts) {
    try {
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      const response = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      console.log("Polling response:", result);

      if (
        result.status === "success" &&
        result.future_links &&
        result.future_links.length > 0
      ) {
        console.log("Processing completed successfully");
        return result.future_links[0];
      } else if (result.status === "processing") {
        console.log("Still processing, continuing to poll...");
        // Adjust delay based on new ETA if provided
        delay = result.eta ? Math.max(result.eta * 1000, 2000) : delay;
      } else {
        throw new Error(`Unexpected status during polling: ${result.status}`);
      }

      attempts++;
    } catch (error) {
      console.error("Polling error:", error);
      throw error;
    }
  }

  throw new Error("Maximum polling attempts reached");
}

async function validateAndLoadModel(modelUrl) {
  console.log("Validating model URL:", modelUrl);
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const headResponse = await fetch(modelUrl, { method: "HEAD" });
    if (headResponse.ok) {
      console.log("Model URL validated successfully");
    } else {
      console.error("Model URL not accessible");
    }
    loadModelIntoPreview(modelUrl);
  } catch (error) {
    console.error("Error validating model URL:", error);
    throw error;
  }
}

function loadModelIntoPreview(modelUrl) {
  console.log("Starting model preview loading");
  const canvas = document.getElementById("modelPreview");
  console.log("Canvas element:", canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.width / canvas.height,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

  console.log("Three.js setup complete");
  console.log("Canvas dimensions:", {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  });

  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  console.log("Lights added to scene");

  const loader = new THREE.GLTFLoader();
  console.log("Loading model from URL:", modelUrl);
  enableDownloadOptions(modelUrl);
  loader.load(
    modelUrl,
    (gltf) => {
      console.log("Model loaded successfully");
      const model = gltf.scene;
      model.scale.set(10, 10, 10);
      model.position.y = -5;
      scene.add(model);

      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      camera.position.z = 35;
      camera.position.y = 10;

      console.log("Camera position set:", {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
      });

      function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      }
      animate();
      console.log("Animation loop started");
    },
    (progress) => {
      console.log("Loading progress:", {
        loaded: progress.loaded,
        total: progress.total,
        percent: ((progress.loaded / progress.total) * 100).toFixed(2) + "%",
      });
    },
    (error) => {
      console.error("Error loading model:", error);
    }
  );
}

function enableDownloadOptions(modelUrl) {
  console.log("Enabling download options for URL:", modelUrl);
  const downloadContainer = document.querySelector(".format-buttons");
  if (!downloadContainer) {
    console.error("Download container not found");
    return;
  }

  // Clear existing buttons
  downloadContainer.innerHTML = "";

  // Create and add download button
  const downloadButton = document.createElement("button");
  downloadButton.textContent = "Download GLB";
  downloadButton.className = "btn btn-primary";
  downloadButton.addEventListener("click", () => {
    console.log("Download button clicked");
    const link = document.createElement("a");
    link.href = modelUrl;
    link.download = "model.glb";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  downloadContainer.appendChild(downloadButton);
}
