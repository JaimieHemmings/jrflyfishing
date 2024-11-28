import * as THREE from 'three';

class WaveVisualizer {
    constructor(bgImage, brushFile) {
        // Canvas and sizes
        this.canvas = document.getElementById('webgl');
        this.sizes = { width: window.innerWidth, height: window.innerHeight };
        
        // Performance optimization tracking
        this.resizeTimer = null;
        this.isInitialized = false;
        
        // Mouse tracking
        this.mousePos = { x: 0, y: 0 };
        this.prevMousePos = { x: 0, y: 0 };
        this.currentWave = 0;

        // Asset references
        this.bgImage = bgImage;
        this.brushFile = brushFile;

        // Scene elements
        this.scene = null;
        this.scene2 = null;
        this.renderer = null;
        this.camera = null;
        this.meshes = [];

        // Texture loader
        this.textureLoader = new THREE.TextureLoader();
    }

    async initializeAssets() {
        // Async texture loading
        const [brushTexture, bgTexture] = await Promise.all([
            this.textureLoader.loadAsync(this.brushFile),
            this.textureLoader.loadAsync(this.bgImage)
        ]);

        return { brushTexture, bgTexture };
    }

    setupScene({ brushTexture, bgTexture }) {
        // Scene setup with loaded textures
        this.scene = new THREE.Scene();
        this.scene2 = new THREE.Scene();
        
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true 
        });
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Optimized camera setup
        const aspect = this.sizes.width / this.sizes.height;
        let frustumSize = this.sizes.height;
        this.camera = new THREE.OrthographicCamera(
            (frustumSize * aspect) / -2, 
            (frustumSize * aspect) / 2,
            frustumSize / 2, 
            frustumSize / -2, 
            -1000, 1000
        );
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

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

        // Wave planes setup with reduced initial count
        const maxCount = 100; // Reduced from 200
        const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
        
        for (let i = 0; i < maxCount; i++) {
            const material = new THREE.MeshBasicMaterial({
                map: brushTexture, 
                transparent: true, 
                blending: THREE.AdditiveBlending,
                depthTest: false, 
                depthWrite: false
            });
            const plane = new THREE.Mesh(planeGeometry, material);
            plane.visible = false;
            plane.rotation.z = Math.random() * Math.PI * 2;
            this.scene.add(plane);
            this.meshes.push(plane);
        }

        // Render target for wave simulation
        this.waveRenderTarget = new THREE.WebGLRenderTarget(this.sizes.width, this.sizes.height, {
            minFilter: THREE.LinearFilter, 
            magFilter: THREE.LinearFilter, 
            format: THREE.RGBAFormat,
        });

        // Background image with shader material
        const imageMaterial = new THREE.ShaderMaterial({
            uniforms: { 
                uImage: { value: bgTexture }, 
                uDisplacement: { value: this.waveRenderTarget.texture } 
            },
            vertexShader, 
            fragmentShader,
        });
        
        this.imagePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), imageMaterial);
        this.scene2.add(this.imagePlane);

        // Setup event listeners
        this.setupEventListeners();

        // Update image plane scale
        this.updateImagePlaneScale();
    }

    setupEventListeners() {
        // Mouse movement tracking
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Optimized resize event with debounce
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    handleMouseMove(e) {
        this.mousePos.x = e.clientX - this.sizes.width / 2;
        this.mousePos.y = this.sizes.height / 2 - e.clientY;
    }

    handleResize() {
        // Clear previous resize timer
        clearTimeout(this.resizeTimer);

        // Debounced resize handling
        this.resizeTimer = setTimeout(() => {
            this.sizes.width = window.innerWidth;
            this.sizes.height = window.innerHeight;

            // Update renderer
            this.renderer.setSize(this.sizes.width, this.sizes.height);

            // Update camera
            const aspect = this.sizes.width / this.sizes.height;
            const frustumSize = this.sizes.height;

            this.camera.left = (frustumSize * aspect) / -2;
            this.camera.right = (frustumSize * aspect) / 2;
            this.camera.top = frustumSize / 2;
            this.camera.bottom = frustumSize / -2;
            this.camera.updateProjectionMatrix();

            // Update image plane
            this.updateImagePlaneScale();
        }, 250);
    }

    updateImagePlaneScale() {
        const imageAspectRatio = 2000 / 1333;
        const viewportAspectRatio = this.sizes.width / this.sizes.height;

        if (viewportAspectRatio > imageAspectRatio) {
            this.imagePlane.scale.x = this.sizes.width;
            this.imagePlane.scale.y = 1333 * (this.sizes.width / 2000);
        } else {
            this.imagePlane.scale.y = this.sizes.height;
            this.imagePlane.scale.x = 2000 * (this.sizes.height / 1333);
        }
    }

    setNewWave(x, y, index) {
        const plane = this.meshes[index];
        plane.visible = true;
        plane.scale.set(0.4, 0.4, 1);
        plane.position.set(x, y, 0);
        plane.material.opacity = 0.2;
    }

    trackMousePos() {
        if (
            Math.abs(this.mousePos.x - this.prevMousePos.x) > 1 || 
            Math.abs(this.mousePos.y - this.prevMousePos.y) > 1
        ) {
            this.currentWave = (this.currentWave + 1) % this.meshes.length;
            this.setNewWave(this.mousePos.x, this.mousePos.y, this.currentWave);
        }
        this.prevMousePos.x = this.mousePos.x;
        this.prevMousePos.y = this.mousePos.y;
    }

    renderWaveSimulationToTexture() {
        this.renderer.setRenderTarget(this.waveRenderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
    }

    animateMeshes() {
        this.meshes.forEach((mesh) => {
            if (mesh.visible) {
                mesh.rotation.z += Math.random() / 100;
                mesh.material.opacity *= 0.98;
                mesh.scale.x = 0.982 * mesh.scale.x + 0.108;
                mesh.scale.y = 0.982 * mesh.scale.y + 0.108;
            }
        });
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        this.trackMousePos();
        this.animateMeshes();
        
        this.renderWaveSimulationToTexture();
        this.renderer.render(this.scene2, this.camera);
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            const assets = await this.initializeAssets();
            this.setupScene(assets);
            this.animate();
            this.isInitialized = true;
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    }

    // Cleanup method to dispose of resources
    dispose() {
        // Dispose geometries, materials, and textures
        this.meshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new WaveVisualizer(bgImage, brushFile);
    visualizer.initialize();

    // Optional: Handle page unload to clean up resources
    window.addEventListener('unload', () => {
        visualizer.dispose();
    });
});