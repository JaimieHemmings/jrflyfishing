import * as THREE from 'three';
// Canvas and sizes
const canvas = document.getElementById('webgl');
const sizes = { width: window.innerWidth, height: window.innerHeight };

// Track mouse position and movement
const mousePos = { x: 0, y: 0 };
const prevMousePos = { x: 0, y: 0 };
let currentWave = 0;
window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX - sizes.width / 2;
    mousePos.y = sizes.height / 2 - e.clientY;
});

// Three.js scene setup
const scene = new THREE.Scene();
const scene2 = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Orthographic camera
const aspect = sizes.width / sizes.height;
let frustumSize = sizes.height;
let camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
    frustumSize / 2, frustumSize / -2, -1000, 1000
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Load brush texture
const brushTexture = new THREE.TextureLoader().load(brushFile);

// Shader setup
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const fragmentShader = `
    uniform sampler2D uImage;
    uniform sampler2D uDisplacement;
    varying vec2 vUv;
    void main() {
        vec2 displacement = texture2D(uDisplacement, vUv).rg * 0.1;
        vec2 uv = vUv + displacement;
        gl_FragColor = texture2D(uImage, uv);
    }
`;

// Wave planes setup
const maxCount = 200;
const meshes = [];
const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
for (let i = 0; i < maxCount; i++) {
    const material = new THREE.MeshBasicMaterial({
        map: brushTexture, transparent: true, blending: THREE.AdditiveBlending,
        depthTest: false, depthWrite: false
    });
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.visible = false;
    plane.rotation.z = Math.random() * Math.PI * 2;
    scene.add(plane);
    meshes.push(plane);
}

// Set new wave at specified index
const setNewWave = (x, y, index) => {
    const plane = meshes[index];
    plane.visible = true;
    plane.scale.set(0.4, 0.4, 1);
    plane.position.set(x, y, 0);
    plane.material.opacity = 0.2;
};

// Update mouse movement for waves
const trackMousePos = () => {
    if (Math.abs(mousePos.x - prevMousePos.x) > 1 || Math.abs(mousePos.y - prevMousePos.y) > 1) {
        currentWave = (currentWave + 1) % maxCount;
        setNewWave(mousePos.x, mousePos.y, currentWave);
    }
    prevMousePos.x = mousePos.x;
    prevMousePos.y = mousePos.y;
};

// Render target for wave simulation
const waveRenderTarget = new THREE.WebGLRenderTarget(sizes.width, sizes.height, {
    minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat,
});
const renderWaveSimulationToTexture = () => {
    renderer.setRenderTarget(waveRenderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
};

// Background image with shader material
const bgTexture = new THREE.TextureLoader().load(bgImage);
const imageMaterial = new THREE.ShaderMaterial({
    uniforms: { uImage: { value: bgTexture }, uDisplacement: { value: waveRenderTarget.texture } },
    vertexShader, fragmentShader,
});
const imagePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imageMaterial);
scene2.add(imagePlane);

// Resize the image plane to fill the viewport responsively
const updateImagePlaneScale = () => {

    // Image aspect ratio
    const imageAspectRatio = 2000 / 1333;

    // Viewport aspect ratio
    const viewportAspectRatio = sizes.width / sizes.height;

    
    // Ensure the imagePlane always fills the the largest dimension of the viewport and maintains aspect ratio for the other axis

    // If the viewport is wider than the image
    if (viewportAspectRatio > imageAspectRatio) {
        imagePlane.scale.x = sizes.width;
        imagePlane.scale.y = 1333 * (sizes.width / 2000);
    } else {
        imagePlane.scale.y = sizes.height;
        imagePlane.scale.x = 2000 * (sizes.height / 1333);
    }    
};

// Animation loop
const animate = () => {
    requestAnimationFrame(animate);
    trackMousePos();
    
    // Animate visible wave meshes
    meshes.forEach((mesh) => {
        if (mesh.visible) {
            mesh.rotation.z += Math.random() / 100;
            mesh.material.opacity *= 0.98;
            mesh.scale.x = 0.982 * mesh.scale.x + 0.108;
            mesh.scale.y = 0.982 * mesh.scale.y + 0.108;
        }
    });
    
    renderWaveSimulationToTexture();
    renderer.render(scene2, camera);
};

document.addEventListener('DOMContentLoaded', () => {
    updateImagePlaneScale();
    
    // Resize event listener
    window.addEventListener('resize', () => {
        // Update the camera including the fustrums
        sizes.width   = window.innerWidth;
        sizes.height  = window.innerHeight;
    
        frustumSize   = sizes.height;
    
        renderer.setSize(sizes.width, sizes.height);
    
        camera.left   = (frustumSize * sizes.width / sizes.height) / -2;
        camera.right  = (frustumSize * sizes.width / sizes.height) / 2;
    
        camera.top    = frustumSize / 2;
        camera.bottom = frustumSize / -2;
        camera.updateProjectionMatrix();
    
        // Update the image plane scale
        updateImagePlaneScale();
    });
    animate();
});