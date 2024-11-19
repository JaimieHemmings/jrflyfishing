import * as THREE from 'three';
// Canvas and sizes
const canvas = document.getElementById('webgl');
const sizes = { width: window.innerWidth, height: window.innerHeight };

// Track mouse position and autonomous wave source position
const mousePos = { x: 0, y: 0 };
const prevMousePos = { x: 0, y: 0 };
const waveSource = { 
    x: 0, 
    y: 0,
    targetX: 0,
    targetY: 0,
    velocity: { x: 0, y: 0 }
};
let currentWave = 0;
let isMouseMoving = false;
let lastMouseMoveTime = 0;

// Mouse movement detection
window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX - sizes.width / 2;
    mousePos.y = sizes.height / 2 - e.clientY;
    isMouseMoving = true;
    lastMouseMoveTime = performance.now();
    waveSource.targetX = mousePos.x;
    waveSource.targetY = mousePos.y;
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
const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2, (frustumSize * aspect) / 2,
    frustumSize / 2, frustumSize / -2, -1000, 1000
);
camera.position.set(0, 0, 5);
camera.lookAt(0, 0, 0);

// Load brush texture
const brushTexture = new THREE.TextureLoader().load(brushFile);

// Shader setup remains the same
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
        vec2 displacement = texture2D(uDisplacement, vUv).rg * 0.04;
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
    plane.scale.set(0.2, 0.2, 1);
    plane.position.set(x, y, 0);
    plane.material.opacity = 0.2;
};

// Autonomous wave movement
const updateWaveSource = (deltaTime) => {
    const now = performance.now();
    const mouseInactivityThreshold = 100; // ms
    
    if (now - lastMouseMoveTime > mouseInactivityThreshold) {
        isMouseMoving = false;
    }

    if (!isMouseMoving) {
        // Create autonomous circular motion
        const time = now * 0.001;
        const radius = Math.min(sizes.width, sizes.height) * 0.25;
        waveSource.targetX = Math.cos(time * 0.5) * radius;
        waveSource.targetY = Math.sin(time * 0.7) * radius;
    }

    // Smooth movement towards target
    const springStrength = 0.1;
    const dampening = 0.8;

    // Calculate spring physics
    const dx = waveSource.targetX - waveSource.x;
    const dy = waveSource.targetY - waveSource.y;
    
    waveSource.velocity.x += dx * springStrength;
    waveSource.velocity.y += dy * springStrength;
    
    waveSource.velocity.x *= dampening;
    waveSource.velocity.y *= dampening;
    
    waveSource.x += waveSource.velocity.x;
    waveSource.y += waveSource.velocity.y;

    // Generate new wave at current position
    currentWave = (currentWave + 1) % maxCount;
    setNewWave(waveSource.x, waveSource.y, currentWave);
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

// Responsive image plane scaling
const updateImagePlaneScale = () => {
    const imageAspectRatio = 2000 / 1333;
    const viewportAspectRatio = sizes.width / sizes.height;
    
    if (viewportAspectRatio > imageAspectRatio) {
        imagePlane.scale.x = sizes.width;
        imagePlane.scale.y = 1333 * sizes.width / 2000;
    } else {
        imagePlane.scale.y = sizes.height;
        imagePlane.scale.x = 2000 * sizes.height / 1333;
    }   
};
updateImagePlaneScale();

// Resize event listener
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    renderer.setSize(sizes.width, sizes.height);
    frustumSize = sizes.height;
    camera.left = (frustumSize * sizes.width / sizes.height) / -2;
    camera.right = (frustumSize * sizes.width / sizes.height) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
    updateImagePlaneScale();
});

// Animation loop
let lastTime = performance.now();
const animate = () => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    requestAnimationFrame(animate);
    updateWaveSource(deltaTime);
    
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

document.addEventListener('DOMContentLoaded', function() {
    animate();
});