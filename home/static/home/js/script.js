import * as THREE from 'three';

const DEFAULTS = {
    MAX_WAVES: 200,
    WAVE_SCALE: 0.4,
    WAVE_OPACITY: 0.2,
    SCALE_DECAY: 0.982,
    SCALE_INCREMENT: 0.108,
    OPACITY_DECAY: 0.98,
    DISPLACEMENT_STRENGTH: 0.1,
    RIPPLE_BRIGHTNESS: 0.3  // Controls the intensity of the white tint
  };

  const shaders = {
    vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform sampler2D uImage;
      uniform sampler2D uDisplacement;
      varying vec2 vUv;
  
      void main() {
        vec4 displacement = texture2D(uDisplacement, vUv);
        
        float dispMagnitude = length(displacement.rg * ${DEFAULTS.DISPLACEMENT_STRENGTH});
        
        vec2 distortedUV = vUv + displacement.rg * ${DEFAULTS.DISPLACEMENT_STRENGTH};
        vec4 bgColor = texture2D(uImage, distortedUV);
        
        float tintStrength = smoothstep(0.0, ${DEFAULTS.DISPLACEMENT_STRENGTH}, dispMagnitude) * ${DEFAULTS.RIPPLE_BRIGHTNESS};
        vec3 tintColor = mix(bgColor.rgb, vec3(1.0), tintStrength);
        
        gl_FragColor = vec4(tintColor, bgColor.a);
      }
    `
  };

class WindowStateTracker {
  constructor() {
    this.previousState = {
      width: window.innerWidth,
      height: window.innerHeight,
      isFullscreen: this.isFullscreen()
    };
    
    this.setupListeners();
  }

  isFullscreen() {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    ) !== null;
  }

  isMaximized() {
    return (
      window.outerWidth === window.screen.availWidth &&
      window.outerHeight === window.screen.availHeight
    );
  }

  getWindowState() {
    const state = {
      width: window.innerWidth,
      height: window.innerHeight,
      isFullscreen: this.isFullscreen(),
      isMaximized: this.isMaximized(),
      isDocked: window.screenX === 0,
      hasWindowDecorations: window.outerHeight - window.innerHeight > 0
    };

    return state;
  }

  setupListeners() {
    let timeout;
    const handleStateChange = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const currentState = this.getWindowState();
        if (this.stateHasChanged(currentState)) {
          this.previousState = currentState;
          window.dispatchEvent(new CustomEvent('windowStateChange', {
            detail: currentState
          }));
        }
      }, 100);
    };

    window.addEventListener('resize', handleStateChange);
    document.addEventListener('fullscreenchange', handleStateChange);
    document.addEventListener('webkitfullscreenchange', handleStateChange);
    document.addEventListener('mozfullscreenchange', handleStateChange);
    
    setInterval(handleStateChange, 1000);
  }

  stateHasChanged(currentState) {
    return (
      currentState.width !== this.previousState.width ||
      currentState.height !== this.previousState.height ||
      currentState.isFullscreen !== this.previousState.isFullscreen ||
      currentState.isMaximized !== this.previousState.isMaximized ||
      currentState.isDocked !== this.previousState.isDocked
    );
  }
}

class MouseTracker {
  constructor(sizes) {
    this.position = { x: 0, y: 0 };
    this.previousPosition = { x: 0, y: 0 };
    this.sizes = sizes;
    this.camera = null;
    this.background = null;
    this.setupEventListeners();
  }

  setCamera(camera) {
    this.camera = camera;
  }

  setBackground(background) {
    this.background = background;
  }

  setupEventListeners() {
    window.addEventListener('mousemove', (e) => {
      // Get normalized device coordinates (NDC)
      const rect = e.target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Convert NDC to world coordinates using camera and background scale
      if (this.camera && this.background) {
        const worldX = x * (this.background.imagePlane.scale.x / 2);
        const worldY = y * (this.background.imagePlane.scale.y / 2);

        this.position.x = worldX;
        this.position.y = worldY;
      }
    });
  }

  hasSignificantMovement() {
    return Math.abs(this.position.x - this.previousPosition.x) > 1 || 
           Math.abs(this.position.y - this.previousPosition.y) > 1;
  }

  updatePreviousPosition() {
    this.previousPosition.x = this.position.x;
    this.previousPosition.y = this.position.y;
  }
}

class WaveSystem {
  constructor(scene, brushTexture) {
    this.scene = scene;
    this.meshes = [];
    this.currentWave = 0;
    this.initializeMeshes(brushTexture);
  }

  initializeMeshes(brushTexture) {
    const planeGeometry = new THREE.PlaneGeometry(100, 100, 1, 1);
    
    for (let i = 0; i < DEFAULTS.MAX_WAVES; i++) {
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
  }

  createWave(x, y) {
    this.currentWave = (this.currentWave + 1) % DEFAULTS.MAX_WAVES;
    const plane = this.meshes[this.currentWave];
    
    plane.visible = true;
    plane.scale.set(DEFAULTS.WAVE_SCALE, DEFAULTS.WAVE_SCALE, 1);
    plane.position.set(x, y, 0);
    plane.material.opacity = DEFAULTS.WAVE_OPACITY;
  }

  update() {
    this.meshes.forEach(mesh => {
      if (mesh.visible) {
        mesh.rotation.z += Math.random() / 100;
        mesh.material.opacity *= DEFAULTS.OPACITY_DECAY;
        mesh.scale.x = DEFAULTS.SCALE_DECAY * mesh.scale.x + DEFAULTS.SCALE_INCREMENT;
        mesh.scale.y = DEFAULTS.SCALE_DECAY * mesh.scale.y + DEFAULTS.SCALE_INCREMENT;
        
        // Hide the wave when it becomes too transparent
        if (mesh.material.opacity < 0.01) {
          mesh.visible = false;
        }
      }
    });
  }
}

class BackgroundImage {
  constructor(scene, bgTexture, waveRenderTarget) {
    this.scene = scene;
    this.imageAspectRatio = 2000 / 1333; // Store original image dimensions
    this.imagePlane = this.createImagePlane(bgTexture, waveRenderTarget);
    this.scene.add(this.imagePlane);
  }

  createImagePlane(bgTexture, waveRenderTarget) {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uImage: { value: bgTexture },
        uDisplacement: { value: waveRenderTarget.texture }
      },
      vertexShader: shaders.vertex,
      fragmentShader: shaders.fragment
    });

    return new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  }

  updateScale(sizes, camera) {
    const viewportAspectRatio = sizes.width / sizes.height;
    
    const scaleToFitWidth = sizes.width;
    const scaleToFitHeight = sizes.width / this.imageAspectRatio;
    
    if (viewportAspectRatio > this.imageAspectRatio) {
      this.imagePlane.scale.x = scaleToFitWidth;
      this.imagePlane.scale.y = scaleToFitHeight;
    } else {
      this.imagePlane.scale.x = sizes.height * this.imageAspectRatio;
      this.imagePlane.scale.y = sizes.height;
    }

    const scaledWidth = this.imagePlane.scale.x;
    const scaledHeight = this.imagePlane.scale.y;
    
    camera.left = -scaledWidth / 2;
    camera.right = scaledWidth / 2;
    camera.top = scaledHeight / 2;
    camera.bottom = -scaledHeight / 2;
    camera.updateProjectionMatrix();
  }
}

class WaveEffect {
  constructor(canvas, bgImage, brushFile) {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.setupRenderer(canvas);
    this.setupCamera();
    
    this.scene = new THREE.Scene();
    this.scene2 = new THREE.Scene();
    
    this.mouseTracker = new MouseTracker(this.sizes);
    this.mouseTracker.setCamera(this.camera);
    
    this.waveRenderTarget = new THREE.WebGLRenderTarget(
      this.sizes.width,
      this.sizes.height,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        stencilBuffer: false,
        depthBuffer: false
      }
    );

    // Initialize window state tracker
    this.windowTracker = new WindowStateTracker();

    Promise.all([
      this.loadTexture(bgImage),
      this.loadTexture(brushFile)
    ]).then(([bgTexture, brushTexture]) => {
      this.waveSystem = new WaveSystem(this.scene, brushTexture);
      this.background = new BackgroundImage(this.scene2, bgTexture, this.waveRenderTarget);
      this.mouseTracker.setBackground(this.background);
      this.background.updateScale(this.sizes, this.camera);
      this.setupResizeHandler();
      this.animate();
    });
  }

  loadTexture(url) {
    return new Promise((resolve) => {
      new THREE.TextureLoader().load(url, resolve);
    });
  }

  setupRenderer(canvas) {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  setupCamera() {
    this.camera = new THREE.OrthographicCamera(
      -this.sizes.width / 2,
      this.sizes.width / 2,
      this.sizes.height / 2,
      -this.sizes.height / 2,
      -1000,
      1000
    );
    
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);
  }

  handleResize() {
    // Update sizes
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;

    // Update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Update render target
    this.waveRenderTarget.setSize(this.sizes.width, this.sizes.height);

    // Update background and camera together
    if (this.background) {
      this.background.updateScale(this.sizes, this.camera);
      // Ensure mouse tracking stays accurate after resize
      if (this.mouseTracker) {
        this.mouseTracker.setCamera(this.camera);
        this.mouseTracker.setBackground(this.background);
      }
    }
  }

  setupResizeHandler() {
    // Regular resize handler with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 100);
    });

    // Window state change handler
    window.addEventListener('windowStateChange', (event) => {
      console.log('Window state changed:', event.detail);
      this.handleResize();
    });

    // Fullscreen change handlers
    document.addEventListener('fullscreenchange', () => this.handleResize());
    document.addEventListener('webkitfullscreenchange', () => this.handleResize());
    document.addEventListener('mozfullscreenchange', () => this.handleResize());
  }

  renderWaveSimulation() {
    this.renderer.setRenderTarget(this.waveRenderTarget);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
  }

  animate = () => {
    requestAnimationFrame(this.animate);

    if (this.mouseTracker.hasSignificantMovement()) {
      this.waveSystem.createWave(
        this.mouseTracker.position.x,
        this.mouseTracker.position.y
      );
    }
    this.mouseTracker.updatePreviousPosition();

    this.waveSystem.update();
    this.renderWaveSimulation();
    this.renderer.render(this.scene2, this.camera);
  };
}

// Initialize the effect
const waveEffect = new WaveEffect(
  document.getElementById('webgl'),
  bgImage,
  brushFile
);

export default WaveEffect;