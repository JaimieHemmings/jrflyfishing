import * as THREE from 'three';
const brushTexture = new THREE.TextureLoader().load('../img/brush.png');

// Get canvas
const canvas = document.getElementById('webgl');

let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// default three js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a plane
const planeGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
const material1 = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  map: brushTexture,
})
const plane = new THREE.Mesh(planeGeometry, material1);


// add cube to scene
scene.add(plane);

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

// animate the cube
const animate = function () {
    requestAnimationFrame(animate);

    plane.rotation.x += 0.01;
    plane.rotation.y += 0.01;

    renderer.render(scene, camera);
};

animate();