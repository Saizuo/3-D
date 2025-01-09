import fetch from 'node-fetch';

const testAPI = async () => {
    const apiKey = 'mtEmozRWSWMXRoaNyqNE4VM11nPpb127tRpoKd6kblZVCcLNLqC3goiQATjF';
    
    // Test image URL
    const testImage = "https://i.pinimg.com/736x/7c/83/64/7c83645c903677dd93ef50fe953dceea.jpg";
    
    const requestData = {
        key: apiKey,
        image: testImage,
        output_format: 'glb',
        ss_sampling_steps: 50,
        slat_sampling_steps: 50,
        resolution: 512,
        temp: "no"
    };

    console.log('Sending test request...');
    
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
        
    } catch (error) {
        console.log('Error:', error);
    }
};

testAPI();
