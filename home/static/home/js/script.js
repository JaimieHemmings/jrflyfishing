import * as THREE from 'three';

class WaveRenderer {
    constructor(brushFile, bgImage) {
        // Performance optimization: Use requestIdleCallback for initialization
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(this.init.bind(this, { brushFile, bgImage }));
        } else {
            this.init({ brushFile, bgImage });
        }
    }

    init({ brushFile, bgImage }) {
        // Early setup to reduce blocking
        this.setupBaseVariables();
        this.createRenderer();
        this.createCamera();
        
        // Async asset loading
        this.loadAssets(brushFile, bgImage)
            .then(() => this.setupScene())
            .then(() => this.startAnimation());
    }

    setupBaseVariables() {
        this.sizes = { 
            width: window.innerWidth, 
            height: window.innerHeight 
        };
        this.mousePos = { x: 0, y: 0 };
        this.waveSource = { 
            x: 0, y: 0,
            targetX: 0, targetY: 0,
            velocity: { x: 0, y: 0 }
        };
        this.currentWave = 0;
        this.isMouseMoving = false;
        this.lastMouseMoveTime = 0;
        this.lastTime = performance.now();
    }

    createRenderer() {
        this.canvas = document.getElementById('webgl');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.sizes.width, this.sizes.height);
        document.body.appendChild(this.renderer.domElement);
    }

    createCamera() {
        const aspect = this.sizes.width / this.sizes.height;
        this.frustumSize = this.sizes.height;
        this.camera = new THREE.OrthographicCamera(
            (this.frustumSize * aspect) / -2, 
            (this.frustumSize * aspect) / 2,
            this.frustumSize / 2, 
            this.frustumSize / -2, 
            -1000, 1000
        );
        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);
    }

    loadAssets(brushFile, bgImage) {
        return new Promise((resolve) => {
            const loadingManager = new THREE.LoadingManager(resolve);
            const textureLoader = new THREE.TextureLoader(loadingManager);
            
            this.brushTexture = textureLoader.load(brushFile, (texture) => {
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.generateMipmaps = true;
            });
            
            this.bgTexture = textureLoader.load(bgImage);
        });
    }

    setupScene() {
        // Create scenes
        this.scene = new THREE.Scene();
        this.scene2 = new THREE.Scene();

        // Setup wave planes
        this.setupWavePlanes();

        // Setup background shader
        this.setupBackgroundShader();

        // Add event listeners
        this.addEventListeners();

        // Update initial image plane scale
        this.updateImagePlaneScale();
    }

    setupWavePlanes() {
        this.maxCount = 200;
        this.meshes = [];
        const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);

        // Use object pooling for wave meshes
        for (let i = 0; i < this.maxCount; i++) {
            const material = new THREE.MeshBasicMaterial({
                map: this.brushTexture, 
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
    }

    setupBackgroundShader() {
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

        // Optimized render target
        this.waveRenderTarget = new THREE.WebGLRenderTarget(this.sizes.width, this.sizes.height, {
            minFilter: THREE.LinearFilter, 
            magFilter: THREE.LinearFilter, 
            format: THREE.RGBAFormat,
            type: THREE.HalfFloatType,
            stencilBuffer: false,
            depthBuffer: false
        });

        this.imageMaterial = new THREE.ShaderMaterial({
            uniforms: { 
                uImage: { value: this.bgTexture }, 
                uDisplacement: { value: this.waveRenderTarget.texture } 
            },
            vertexShader, 
            fragmentShader,
        });

        this.imagePlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.imageMaterial);
        this.scene2.add(this.imagePlane);
    }

    addEventListeners() {
        // Throttled mouse move
        this.throttledMouseMove = this.throttle(this.handleMouseMove.bind(this), 16);
        window.addEventListener('mousemove', this.throttledMouseMove);

        // Resize with debounce
        this.debouncedResize = this.debounce(this.handleResize.bind(this), 250);
        window.addEventListener('resize', this.debouncedResize);
    }

    // Utility methods for event handling
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, delay) {
        let timeoutId;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(context, args), delay);
        }
    }

    handleMouseMove(e) {
        this.mousePos.x = e.clientX - this.sizes.width / 2;
        this.mousePos.y = this.sizes.height / 2 - e.clientY;
        this.isMouseMoving = true;
        this.lastMouseMoveTime = performance.now();
        this.waveSource.targetX = this.mousePos.x;
        this.waveSource.targetY = this.mousePos.y;
    }

    handleResize() {
        this.sizes.width = window.innerWidth;
        this.sizes.height = window.innerHeight;
        
        if (this.sizes.width > 768 )
        {
            this.renderer.setSize(this.sizes.width, this.sizes.height);
            
            const aspect = this.sizes.width / this.sizes.height;
            this.camera.left = (this.frustumSize * aspect) / -2;
            this.camera.right = (this.frustumSize * aspect) / 2;
            this.camera.top = this.frustumSize / 2;
            this.camera.bottom = this.frustumSize / -2;
            this.camera.updateProjectionMatrix();
            
            this.updateImagePlaneScale();
            this.waveRenderTarget.setSize(this.sizes.width, this.sizes.height);
        }    
    }

    updateImagePlaneScale() {
        const imageAspectRatio = 2000 / 1333;
        const viewportAspectRatio = this.sizes.width / this.sizes.height;
        
        if (viewportAspectRatio > imageAspectRatio) {
            this.imagePlane.scale.x = this.sizes.width;
            this.imagePlane.scale.y = 1333 * this.sizes.width / 2000;
        } else {
            this.imagePlane.scale.y = this.sizes.height;
            this.imagePlane.scale.x = 2000 * this.sizes.height / 1333;
        }   
    }

    updateWaveSource(deltaTime) {
        const now = performance.now();
        const mouseInactivityThreshold = 100;
        
        if (now - this.lastMouseMoveTime > mouseInactivityThreshold) {
            this.isMouseMoving = false;
        }

        if (!this.isMouseMoving) {
            const time = now * 0.001;
            const radius = Math.min(this.sizes.width, this.sizes.height) * 0.25;
            this.waveSource.targetX = Math.cos(time * 0.5) * radius;
            this.waveSource.targetY = Math.sin(time * 0.7) * radius;
        }

        const springStrength = 0.1;
        const dampening = 0.8;

        const dx = this.waveSource.targetX - this.waveSource.x;
        const dy = this.waveSource.targetY - this.waveSource.y;
        
        this.waveSource.velocity.x += dx * springStrength;
        this.waveSource.velocity.y += dy * springStrength;
        
        this.waveSource.velocity.x *= dampening;
        this.waveSource.velocity.y *= dampening;
        
        this.waveSource.x += this.waveSource.velocity.x;
        this.waveSource.y += this.waveSource.velocity.y;

        this.currentWave = (this.currentWave + 1) % this.maxCount;
        this.setNewWave(this.waveSource.x, this.waveSource.y, this.currentWave);
    }

    setNewWave(x, y, index) {
        const plane = this.meshes[index];
        plane.visible = true;
        plane.scale.set(0.2, 0.2, 1);
        plane.position.set(x, y, 0);
        plane.material.opacity = 0.2;
    }

    startAnimation() {
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    animate() {
        requestAnimationFrame(this.animate);

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.updateWaveSource(deltaTime);
        
        // Optimize mesh updates
        const visibleMeshes = this.meshes.filter(mesh => mesh.visible);
        
        for (let mesh of visibleMeshes) {
            mesh.rotation.z += Math.random() / 100;
            mesh.material.opacity *= 0.98;
            
            // Smoother scaling with lerp
            mesh.scale.x += (1 - mesh.scale.x) * 0.1;
            mesh.scale.y += (1 - mesh.scale.y) * 0.1;
            
            // Hide mesh if opacity is very low
            if (mesh.material.opacity < 0.01) {
                mesh.visible = false;
            }
        }
        
        // Render wave simulation
        this.renderer.setRenderTarget(this.waveRenderTarget);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setRenderTarget(null);
        
        // Render final scene
        this.renderer.render(this.scene2, this.camera);
    }

    // Cleanup method
    dispose() {
        // Remove event listeners
        window.removeEventListener('mousemove', this.throttledMouseMove);
        window.removeEventListener('resize', this.debouncedResize);

        // Dispose geometries, materials, and textures
        this.meshes.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });

        this.brushTexture.dispose();
        this.bgTexture.dispose();
        this.waveRenderTarget.dispose();
        this.renderer.dispose();
    }
}

// Usage
document.addEventListener('DOMContentLoaded', () => {
    const waveRenderer = new WaveRenderer(brushFile, bgImage);
});