// globe.js

document.addEventListener("DOMContentLoaded", () => {
    // Basic Setup
    const initGlobeContext = (containerId, isInteractive = false) => {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = isInteractive ? 150 : 200;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Core Globe
        const radius = 50;
        const segments = 64;

        // Realistic Earth Sphere
        const geometry = new THREE.SphereGeometry(radius, segments, segments);

        // Load High-Res Earth Texture (Blue Marble)
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

        const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            emissive: 0x0f172a,
            emissiveIntensity: 0.1,
            specular: 0x111111,
            shininess: 15,
            transparent: true,
            opacity: 0.95,
        });
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);

        // Wireframe Overlay
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0x0ea5e9,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const wireGlobe = new THREE.Mesh(geometry, wireMaterial);
        // Slightly larger to prevent z-fighting
        wireGlobe.scale.set(1.01, 1.01, 1.01);
        scene.add(wireGlobe);

        // Grid/Atmosphere glow
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.05,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
        });
        const glowGeometry = new THREE.SphereGeometry(radius * 1.15, 32, 32);
        const atmosphere = new THREE.Mesh(glowGeometry, glowMaterial);
        scene.add(atmosphere);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x0ea5e9, 2);
        pointLight.position.set(100, 100, 100);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0x10b981, 1.5);
        pointLight2.position.set(-100, -100, 50);
        scene.add(pointLight2);

        // Markers Structure
        const markers = [];
        const markerGroup = new THREE.Group();
        globe.add(markerGroup);

        // Helpers
        const getCoordinates = (lat, lng, rad) => {
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);

            const x = -(rad * Math.sin(phi) * Math.cos(theta));
            const z = (rad * Math.sin(phi) * Math.sin(theta));
            const y = (rad * Math.cos(phi));
            return new THREE.Vector3(x, y, z);
        };

        const addMarker = (lat, lng, color, data) => {
            const pos = getCoordinates(lat, lng, radius);

            // Marker geometries
            const mGeo = new THREE.SphereGeometry(1.5, 16, 16);
            const mMat = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 1
            });
            const marker = new THREE.Mesh(mGeo, mMat);
            marker.position.copy(pos);

            // Attach data for raycasting
            marker.userData = data;

            markerGroup.add(marker);
            markers.push(marker);

            // Ring animation around marker
            const rGeo = new THREE.RingGeometry(2, 3, 32);
            const rMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(rGeo, rMat);
            ring.position.copy(pos);
            ring.lookAt(new THREE.Vector3(0, 0, 0)); // face outwards
            markerGroup.add(ring);

            return ring;
        };

        // Add real news nodes from backend
        const rings = [];
        if (isInteractive) {
            // Fetch live data from server silently
            fetch('http://localhost:3000/api/map-data')
                .then(res => res.json())
                .then(apiData => {
                    if (apiData && apiData.data) {
                        apiData.data.forEach(node => {
                        apiData.data.forEach(node => {
                            const isFake = node.status === 'FAKE';
                            const color = isFake ? 0xff3333 : 0x00ff88;
                            const desc = node.desc || "Verified by decentralized nodes. Transparency valid.";
                            
                            // Add marker
                            const markerRing = addMarker(node.lat, node.lng, color, {
                                title: node.title,
                                desc: desc,
                                status: node.status,
                                auth: node.auth,
                                loc: node.loc
                            });

                            // For FAKE items, add an extra inner 'alert' pulse
                            if (isFake) {
                                markerRing.userData = { pulseSpeed: 0.05, isAlert: true };
                            }
                            rings.push(markerRing);
                        });
                        });
                    }
                })
                .catch(err => {
                    console.log("Could not load backend map nodes; ensure server is running.");
                    // Fallback dummy nodes if server is offline
                    rings.push(addMarker(28.6, 77.2, 0xef4444, { title: "Protest Video Verification", desc: "Clips from early 2019 being shared as live. Consensus: FAKE.", status: "FAKE", auth: "Aajtak", loc: "New Delhi, IN" }));
                    rings.push(addMarker(40.7, -74.0, 0x10b981, { title: "Stock Market Crash Rumors", desc: "AI generated charts circulating. Confirmed legitimate by SEC sources.", status: "TRUTH", auth: "Times of India", loc: "New York, US" }));
                });
        } else {
            // Just random background dots
            for (let i = 0; i < 15; i++) {
                rings.push(addMarker((Math.random() - 0.5) * 160, (Math.random() - 0.5) * 360, Math.random() > 0.5 ? 0x0ea5e9 : 0x8b5cf6, null));
            }
        }

        // Controls
        let controls;
        if (isInteractive && typeof THREE.OrbitControls !== 'undefined') {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enablePan = false;
            controls.minDistance = 60;
            controls.maxDistance = 200;
            // Enable auto rotation matching the previous map
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.0;
        }

        // Interaction Setup
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        if (isInteractive) {
            const popup = document.getElementById("map-popup");
            const mapTitle = document.getElementById("map-popup-title");
            const mapDesc = document.getElementById("map-popup-desc");
            const mapStatus = document.getElementById("map-popup-status");
            const mapAuth = document.getElementById("map-popup-authority");
            const mapLoc = document.getElementById("map-popup-location");

            window.closeMapPopup = () => {
                popup.classList.add("is-hidden");
                // Reset zoom
                if (controls) {
                    Motion.animate(controls.object.position, { "z": 150 }, { duration: 1 });
                }
            };

            container.addEventListener("click", (e) => {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(markers);

                if (intersects.length > 0) {
                    const obj = intersects[0].object;
                    const data = obj.userData;

                    if (data) {
                        // Populate popup
                        mapTitle.innerText = data.title;
                        mapDesc.innerText = data.desc;
                        mapLoc.innerText = data.loc;
                        mapAuth.innerText = "Verified by " + data.auth;
                        mapStatus.innerText = data.status;

                        if (data.status === "FAKE") {
                            mapStatus.className = "tag is-danger is-light mb-3 has-text-weight-bold";
                        } else {
                            mapStatus.className = "tag is-success is-light mb-3 has-text-weight-bold";
                        }

                        // Show and aniamte popup
                        popup.classList.remove("is-hidden");
                        Motion.animate(popup, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.3 });

                        // Focus Camera on Marker (Zoom in)
                        const targetPos = new THREE.Vector3().copy(obj.position).multiplyScalar(1.5).applyMatrix4(globe.matrixWorld);

                        // Simple animated zoom
                        // For a real production app, we would use GSAP/Motion to animate camera position and target
                        // For simplicity, we just adjust the orbit controls.
                    }
                } else {
                    closeMapPopup();
                }
            });

            // Hover effects
            container.addEventListener("mousemove", (e) => {
                const rect = renderer.domElement.getBoundingClientRect();
                mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(markers);

                if (intersects.length > 0) {
                    container.style.cursor = 'pointer';
                    intersects[0].object.scale.set(1.5, 1.5, 1.5);
                } else {
                    container.style.cursor = 'grab';
                    markers.forEach(m => m.scale.set(1, 1, 1));
                }
            });
        }

        // Window resize
        window.addEventListener('resize', () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        if (isInteractive) {
            window.activeGlobe = {
                camera,
                controls,
                getCoordinates // Helper to reuse within the jump function
            };
        }

        // Animation Loop
        let time = 0;
        const animateGlobe = () => {
            requestAnimationFrame(animateGlobe);
            time += 0.02;

            // Pulse Rings
            rings.forEach((ring, idx) => {
                const data = ring.userData || {};
                const speed = data.pulseSpeed || 0.02;
                const isAlert = data.isAlert || false;
                
                // If it's an alert, multiply timing for a more aggressive pulse
                const timing = isAlert ? (time * 2.5 + idx) : (time + idx);
                const scaleModifier = isAlert ? 0.8 : 0.3;
                
                const scale = 1 + Math.sin(timing) * scaleModifier;
                ring.scale.set(scale, scale, 1);
                ring.material.opacity = isAlert ? (0.7 - (scale - 1)) : (0.5 - (scale - 1));
            });

            if (!isInteractive) {
                // Auto rotate background globe slowly
                globe.rotation.y += 0.001;
                globe.rotation.x += 0.0005;
                wireGlobe.rotation.y += 0.001;
                wireGlobe.rotation.x += 0.0005;
            } else {
                if (controls) controls.update();
                else {
                    globe.rotation.y += 0.005;
                }
            }

            renderer.render(scene, camera);
        };

        animateGlobe();
    };

    // Global Access for focusing nodes
    window.focusGlobeOnNode = (lat, lng, title) => {
        // Find the interactive globe context (we know it's the second one)
        // For a more robust approach, we'd store the camera/controls in a global object
        const container = document.getElementById('globe-interactive');
        if (!container) return;

        // Dispatch a custom event or use a global reference
        // Let's create a global reference during initialization
    };

    // Initialize both globes
    try {
        initGlobeContext("globe-container", false); // Background ambient
        const interactive = initGlobeContext("globe-interactive", true); // Interactive Map
        
        // Expose a method to focus on a node from anywhere
        window.jumpToGlobeMarker = (lat, lng) => {
            if (!window.activeGlobe || !window.Motion) return;
            const { camera, controls, getCoordinates } = window.activeGlobe;
            
            // 1. Convert lat/lng to target 3D world position
            const targetPos = getCoordinates(lat, lng, 120); // Zoom closer (radius is 50)
            
            // 2. Animate camera position
            window.Motion.animate(camera.position, 
                { x: targetPos.x, y: targetPos.y, z: targetPos.z }, 
                { duration: 1.5, easing: [0.22, 1, 0.36, 1] }
            );

            // 3. Briefly disable auto-rotate to allow user to inspect the node
            if (controls) {
                controls.autoRotate = false;
                setTimeout(() => { controls.autoRotate = true; }, 10000);
            }
        };
    } catch (e) {
        console.error("Three.js visualization error:", e);
    }
});
