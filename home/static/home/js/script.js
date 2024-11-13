import * as THREE from 'three';

// load the brush image as a texture
const brushTexture = new THREE.TextureLoader().load(brushFile);


// Get canvas
const canvas = document.getElementById('webgl');

let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

let mousePos = {
    x: 0,
    y: 0
}

let prevMousePos = {
    x: 0,
    y: 0
}

let currentWave = 0;

window.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX - sizes.width / 2;
    mousePos.y = sizes.height / 2 - e.clientY;
});

// default three js setup
const scene = new THREE.Scene();
const scene2 = new THREE.Scene();

// Orthographic camera
let frustumSize = sizes.height;
let aspect = sizes.width / sizes.height;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    frustumSize / -2,
    -1000, 1000);


const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
let meshes = [];
let maxCount = 200;
for  (let i = 0; i < maxCount; i++) {
    // Create a plane
    const material = new THREE.MeshBasicMaterial({
        map: brushTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
    })
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.visible = false;

    // Randomize the rotation of the plane
    plane.rotation.z = Math.random() * Math.PI * 2;

    scene.add(plane);
    meshes.push(plane);
}

// position camera
camera.position.z = 5;
camera.position.y = 1;
camera.position.x = 1;

camera.lookAt(0, 0, 0);

// Function to resize canvas on window resize
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;

    
    frustumSize = sizes.height;
    aspect = sizes.width / sizes.height;
    camera.left = frustumSize * aspect / -2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    renderer.setSize(sizes.width, sizes.height);
    camera.updateProjectionMatrix();
});

const setNewWave = (x, y, index) => {
    meshes[index].visible = true;
    meshes[index].scale.x = 0.4;
    meshes[index].scale.y = 0.4;
    meshes[index].position.x = x;
    meshes[index].position.y = y;
    meshes[index].material.opacity = 0.2;
    meshes[index].material.needsUpdate = true;
};

// Track mouse position and update wave if cursor moved more than 1px in both x and y directions
let trackMousepos = () => {
    if (Math.abs(mousePos.x - prevMousePos.x) > 1 || Math.abs(mousePos.y - prevMousePos.y) > 1) {
        currentWave = (currentWave + 1) % maxCount;
        setNewWave(mousePos.x, mousePos.y, currentWave);
    }
    prevMousePos.x = mousePos.x;
    prevMousePos.y = mousePos.y;
};


// Create a render target
const waveRenderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
});

// Function to render the wave simulation to the render target
const renderWaveSimulationToTexture = () => {
    renderer.setRenderTarget(waveRenderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
};

// Vertex shader
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment shader
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

// Create the shader material
const imageMaterial = new THREE.ShaderMaterial({
    uniforms: {
        uImage: { value: new THREE.TextureLoader().load(bgImage) },
        uDisplacement: { value: waveRenderTarget.texture }
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

// Create a plane geometry
const bgGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight);

// Create a mesh with the plane geometry and shader material
const imagePlane = new THREE.Mesh(bgGeometry, imageMaterial);

// Add the image plane to the scene
scene2.add(imagePlane);

// animate the scene
const animate = function () {
    requestAnimationFrame(animate);
    trackMousepos();
    // Update the properties of visible meshes
    meshes.forEach((mesh) => {
        if (mesh.visible) {
            mesh.rotation.z += Math.random() / 100;
            mesh.material.opacity *= 0.98;
            mesh.scale.x = 0.98 * mesh.scale.x + 0.1;
            mesh.scale.y = 0.98 * mesh.scale.y + 0.1;
        }
    });
    // Render the wave simulation to the texture
    renderWaveSimulationToTexture();
    renderer.render(scene2, camera);
};
// Start the animation loop
animate();