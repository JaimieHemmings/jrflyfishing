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
let maxCount = 50;
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
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
});

const setNewWave = (x, y, index) => {
    meshes[index].visible = true;
    meshes[index].position.x = x;
    meshes[index].position.y = y;
    meshes[index].material.opacity = 1;
    meshes[index].material.needsUpdate = true;
    setTimeout(() => {
        meshes[index].visible = false;
    }, 1000);
};

// Function to track mouse position
let trackMousepos = () => {
    if (Math.abs(mousePos.x - prevMousePos.x) > 100 && Math.abs(mousePos.y - prevMousePos.y) > 100)
    {
        currentWave = (currentWave + 1) % maxCount;
        setNewWave(mousePos.x, mousePos.y, currentWave);
    } 
};


// animate the cube
const animate = function () {
    requestAnimationFrame(animate);

    trackMousepos();

    // Update the position of the planes
    meshes.forEach((mesh) => {
        mesh.rotation.z += 0.01;
        mesh.material.opacity *= 0.98;
        mesh.scale.x += 0.01;
        mesh.scale.y += 0.01;
    });

    renderer.render(scene, camera);
};

animate();