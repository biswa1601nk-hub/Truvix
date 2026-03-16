// hero-compass.js

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("hero-compass");
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();

    // Camera settings
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    // Adjusted camera distance to perfectly contain the compass without cutting off the edges
    camera.position.set(0, 60, 165);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const compassGroup = new THREE.Group();
    // Shift the entire compass up slightly (5 instead of 15) to prevent cropping the top ring
    compassGroup.position.y = 5;
    scene.add(compassGroup);

    // Color Palette
    const cyanLight = 0x00ffff;
    const cyanDark = 0x0088cc;
    const neonBlue = 0x0055ff;
    const cyberGreen = 0x00ff88;
    const deepBg = 0x050a15;

    // --- 1. OUTER HOLOGRAPHIC RING ---
    const outerRadius = 55;
    const outerRingGeo = new THREE.RingGeometry(outerRadius - 1.5, outerRadius, 64);
    const outerRingMat = new THREE.MeshBasicMaterial({
        color: cyanDark,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    compassGroup.add(outerRing);

    // Outer Dashboard Ticks (Precise measurement ring)
    const ticksGroup = new THREE.Group();
    for (let i = 0; i < 72; i++) {
        const isMajor = i % 6 === 0;
        const tickGeo = new THREE.BoxGeometry(0.5, 0.5, isMajor ? 5 : 2);
        const tickMat = new THREE.MeshBasicMaterial({
            color: isMajor ? cyanLight : cyberGreen,
            transparent: true,
            opacity: isMajor ? 0.9 : 0.4,
            blending: THREE.AdditiveBlending
        });
        const tick = new THREE.Mesh(tickGeo, tickMat);
        const angle = (i / 72) * Math.PI * 2;
        tick.position.set(Math.cos(angle) * outerRadius, 0, Math.sin(angle) * outerRadius);
        tick.lookAt(0, 0, 0);
        ticksGroup.add(tick);
    }
    compassGroup.add(ticksGroup);

    // --- 2. MIDDLE DATA GIMBALS (Torus) ---
    const gimbalMat = new THREE.MeshPhongMaterial({
        color: deepBg,
        emissive: neonBlue,
        emissiveIntensity: 0.3,
        specular: cyanLight,
        shininess: 100,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });

    const gimbalGeo1 = new THREE.TorusGeometry(45, 1, 16, 64);
    const gimbal1 = new THREE.Mesh(gimbalGeo1, gimbalMat);
    gimbal1.rotation.x = Math.PI / 2;
    compassGroup.add(gimbal1);

    const gimbalGeo2 = new THREE.TorusGeometry(38, 0.5, 16, 64);
    const gimbalMatSolid = new THREE.MeshPhongMaterial({
        color: deepBg,
        emissive: 0x0b1329,
        specular: cyanLight,
        shininess: 50,
        transparent: true,
        opacity: 0.8
    });
    const gimbal2 = new THREE.Mesh(gimbalGeo2, gimbalMatSolid);
    compassGroup.add(gimbal2);

    // --- 3. INNER QUANTUM CORE (Icosahedron) ---
    const coreGeo = new THREE.IcosahedronGeometry(12, 0);
    const coreMat = new THREE.MeshPhongMaterial({
        color: cyberGreen,
        emissive: cyberGreen,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.9,
        flatShading: true
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    compassGroup.add(core);

    // Core Wireframe shell
    const coreWireGeo = new THREE.IcosahedronGeometry(14, 1);
    const coreWireMat = new THREE.MeshBasicMaterial({
        color: cyanLight,
        wireframe: true,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending
    });
    const coreWire = new THREE.Mesh(coreWireGeo, coreWireMat);
    compassGroup.add(coreWire);


    // --- 5. DATA PARTICLES ENVIRONMENT ---
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 120;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
        size: 0.8,
        color: cyanLight,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    const particleMesh = new THREE.Points(particlesGeo, particleMat);
    compassGroup.add(particleMesh);

    // Adjust compass angle to look dramatic
    compassGroup.rotation.x = 0.5; // Tilt
    compassGroup.rotation.z = -0.15;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Cyber Neon Light
    const pointLight1 = new THREE.PointLight(cyanLight, 3, 200);
    pointLight1.position.set(50, 50, 30);
    scene.add(pointLight1);

    // Cyber Green Light
    const pointLight2 = new THREE.PointLight(cyberGreen, 2, 200);
    pointLight2.position.set(-50, -20, -30);
    scene.add(pointLight2);

    // Orbit Controls
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
    }

    // Window resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // --- ANIMATION LOOP ---
    let time = 0;
    const animateCompass = () => {
        requestAnimationFrame(animateCompass);
        time += 0.01;

        if (controls) controls.update();

        // Rotate Outer Elements
        ticksGroup.rotation.y -= 0.002;
        outerRing.rotation.z += 0.001;

        // Multi-axis Gimbal rotations
        gimbal1.rotation.y += 0.01;
        gimbal1.rotation.x = Math.PI / 2 + Math.sin(time) * 0.1;

        gimbal2.rotation.x = Math.PI / 2 + Math.sin(time * 0.8) * 0.3;
        gimbal2.rotation.y += 0.015;

        // Core Pulse & Spin
        core.rotation.y -= 0.02;
        core.rotation.x += 0.01;
        const scalePulse = 1 + Math.sin(time * 3) * 0.05;
        core.scale.set(scalePulse, scalePulse, scalePulse);

        coreWire.rotation.y += 0.01;
        coreWire.rotation.z -= 0.02;

        // Particle floating
        particleMesh.rotation.y += 0.001;
        particleMesh.rotation.x = Math.sin(time * 0.5) * 0.1;



        renderer.render(scene, camera);
    };

    animateCompass();
});
