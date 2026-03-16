// hero-globe.js

document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("hero-globe");
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 180; // Zoom out to fit nicely

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Core Globe Size
    const radius = 60;
    const segments = 64;

    // Dark Base Sphere
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshPhongMaterial({
        color: 0x02040a,
        emissive: 0x0b0f19,
        specular: 0x00d2ff,
        shininess: 25,
        transparent: true,
        opacity: 0.9,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Wireframe Overlay to match Singularity aesthetic
    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0x00d2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.2
    });
    const wireGlobe = new THREE.Mesh(geometry, wireMaterial);
    wireGlobe.scale.set(1.01, 1.01, 1.01);
    globe.add(wireGlobe); // Added to globe instead of scene so it rotates with it

    // Grid/Atmosphere glow
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x3a7bd5,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
    });
    const glowGeometry = new THREE.SphereGeometry(radius * 1.15, 32, 32);
    const atmosphere = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(atmosphere);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d2ff, 2);
    pointLight.position.set(100, 100, 100);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x10b981, 1.5);
    pointLight2.position.set(-100, -100, 50);
    scene.add(pointLight2);

    // Orbit Controls
    let controls;
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.enablePan = false;
        controls.enableZoom = false; // Disable zooming so it doesn't mess with page scroll
        controls.autoRotate = true; // Make the camera spin around the globe smoothly
        controls.autoRotateSpeed = 1.0;
    }

    // Add some dummy "active nodes" flashing on the globe
    const markerGroup = new THREE.Group();
    globe.add(markerGroup);

    const getCoordinates = (lat, lng, rad) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);
        const x = -(rad * Math.sin(phi) * Math.cos(theta));
        const z = (rad * Math.sin(phi) * Math.sin(theta));
        const y = (rad * Math.cos(phi));
        return new THREE.Vector3(x, y, z);
    };

    const addMarker = (lat, lng, color) => {
        const pos = getCoordinates(lat, lng, radius);
        const rGeo = new THREE.RingGeometry(1.5, 3, 32);
        const rMat = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.position.copy(pos);
        ring.lookAt(new THREE.Vector3(0, 0, 0));
        markerGroup.add(ring);
        return ring;
    };

    const rings = [];
    // Random nodes flashing
    for (let i = 0; i < 8; i++) {
        rings.push(addMarker(
            (Math.random() - 0.5) * 160,
            (Math.random() - 0.5) * 360,
            Math.random() > 0.5 ? 0x00d2ff : 0x10b981 // Cyan or Green
        ));
    }

    // Window resize handling
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Animation Loop
    let time = 0;
    const animateGlobe = () => {
        requestAnimationFrame(animateGlobe);
        time += 0.03;

        // Auto rotate
        if (controls) {
            controls.update();
        }
        // Rotate globe slightly on its own axis as well for dynamic effect
        globe.rotation.y += 0.002;
        globe.rotation.z += 0.0005;

        // Pulse the data nodes
        rings.forEach((ring, idx) => {
            const scale = 1 + Math.sin(time + idx) * 0.4;
            ring.scale.set(scale, scale, 1);
            ring.material.opacity = 0.5 - (scale - 1) * 0.5;
        });

        renderer.render(scene, camera);
    };

    animateGlobe();
});
