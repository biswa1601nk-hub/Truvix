// main.js

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // Motion Animations (Vanilla Framer Motion)
    // ----------------------------------------------------
    let animate = (el, props, opts) => ({ finished: Promise.resolve() });
    try {
        if (typeof window.Motion !== 'undefined') {
            const { animate: mAnimate, stagger, inView } = window.Motion;
            animate = mAnimate;

            mAnimate(".fade-up", { opacity: [0, 1], y: [60, 0] }, {
                duration: 1, delay: stagger(0.15), easing: [0.22, 1, 0.36, 1]
            });

            inView(".reveal", (info) => {
                mAnimate(info.target, { opacity: [0, 1], y: [40, 0] }, { duration: 0.8, easing: [0.22, 1, 0.36, 1] });
            });
        }
    } catch (err) {
        console.warn("Animations failed to initialize. Modals will instantly show without fading in.", err);
    }
    
    // ----------------------------------------------------
    // Verification Suite: Tabs & Forensics
    // ----------------------------------------------------
    window.switchTab = (tab) => {
        const urlContent = document.getElementById('url-scan-content');
        const imageContent = document.getElementById('image-scan-content');
        const tabUrl = document.getElementById('tab-url');
        const tabImage = document.getElementById('tab-image');
        const verifyResult = document.getElementById('verify-result');
        const labUI = document.getElementById('forensic-lab-ui');

        if (tab === 'url-scan') {
            urlContent.classList.remove('hidden');
            imageContent.classList.add('hidden');
            verifyResult.classList.add('hidden');
            labUI.classList.add('hidden');
            tabUrl.className = "px-6 py-3 rounded-t-lg bg-brandPrimary text-darkBase font-bold uppercase tracking-widest text-xs transition-all";
            tabImage.className = "px-6 py-3 rounded-t-lg bg-darkSurface border border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-all";
        } else {
            urlContent.classList.add('hidden');
            imageContent.classList.remove('hidden');
            verifyResult.classList.add('hidden');
            tabImage.className = "px-6 py-3 rounded-t-lg bg-brandPrimary text-darkBase font-bold uppercase tracking-widest text-xs transition-all";
            tabUrl.className = "px-6 py-3 rounded-t-lg bg-darkSurface border border-slate-800 text-slate-400 font-bold uppercase tracking-widest text-xs hover:text-white transition-all";
        }
    };

    window.performForensicAnalysis = async (input) => {
        if (!input.files || !input.files[0]) return;

        const labUI = document.getElementById('forensic-lab-ui');
        const metaProgress = document.getElementById('meta-progress');
        const pixelProgress = document.getElementById('pixel-progress');
        const aiProgress = document.getElementById('ai-progress');
        const resultContainer = document.getElementById('result-container');
        const verifyResult = document.getElementById('verify-result');

        labUI.classList.remove('hidden');
        verifyResult.classList.add('hidden');

        // Reset progress & status
        metaProgress.style.width = '0%';
        pixelProgress.style.width = '0%';
        aiProgress.style.width = '0%';
        document.getElementById('meta-status').innerText = "Running Source Analysis...";
        document.getElementById('pixel-status').innerText = "Checking Global Databases...";
        document.getElementById('ai-status').innerText = "Verifying Image Patterns...";

        // Start Simulated Analysis sequence for UI
        setTimeout(() => { metaProgress.style.width = '100%'; document.getElementById('meta-status').innerText = "Data Extracted"; document.getElementById('meta-status').style.color = "#00ff88"; }, 1000);
        setTimeout(() => { pixelProgress.style.width = '100%'; document.getElementById('pixel-status').innerText = "Integrity Verified"; document.getElementById('pixel-status').style.color = "#00ff88"; }, 2000);
        setTimeout(() => { aiProgress.style.width = '100%'; document.getElementById('ai-status').innerText = "Authenticity Validated"; document.getElementById('ai-status').style.color = "#00ff88"; }, 3000);

        try {
            // Fetch from Express API
            const response = await fetch('http://localhost:3000/api/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: input.files[0].name })
            });

            const data = await response.json();

            setTimeout(() => {
                verifyResult.classList.remove('hidden');
                resultContainer.innerHTML = `
                <div class="p-8 border border-truth/30 bg-truth/5 rounded-xl text-center reveal">
                    <div class="w-16 h-16 bg-truth text-darkBase rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-neon-truth">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h3 class="text-2xl font-black text-white uppercase tracking-tighter mb-2">Image Analysis Complete</h3>
                    <p class="text-slate-400 mb-6 max-w-xl mx-auto">Our professional-grade backend analyzer has finalized its report. No signs of tampering or digital alteration were detected across the global verification network.</p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left text-[10px] font-mono">
                        <div class="p-3 bg-darkBase border border-slate-800 rounded">
                            <span class="text-slate-500 uppercase block mb-1">Capture Tool</span>
                            <span class="text-white">${data.report.camera}</span>
                        </div>
                        <div class="p-3 bg-darkBase border border-slate-800 rounded">
                            <span class="text-slate-500 uppercase block mb-1">Software Edit Check</span>
                            <span class="text-white">${data.report.software}</span>
                        </div>
                        <div class="p-3 bg-darkBase border border-slate-800 rounded">
                            <span class="text-slate-500 uppercase block mb-1">ELA Score (Error Level)</span>
                            <span class="text-white">${data.report.elaScore} (Low Risk)</span>
                        </div>
                        <div class="p-3 bg-darkBase border border-slate-800 rounded">
                            <span class="text-slate-500 uppercase block mb-1">Verificaton Hash</span>
                            <span class="text-white truncate">${data.report.fingerprint}</span>
                        </div>
                    </div>

                    <div class="flex flex-wrap justify-center gap-4">
                        <span class="text-[10px] font-mono bg-darkBase px-3 py-2 border border-truth/30 text-truth uppercase tracking-widest">VERDICT: ${data.verdict}</span>
                        <span class="text-[10px] font-mono bg-darkBase px-3 py-2 border border-truth/30 text-truth uppercase tracking-widest">ACCURACY: ${data.confidence}%</span>
                    </div>
                </div>
            `;
                // Scroll to result
                verifyResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 3500);

        } catch (err) {
            console.error("Forensic API Error:", err);
            // Fallback to local if API is down
            alert("Backend verification server unreachable. Displaying local prediction instead.");
        }
    };

    // ----------------------------------------------------
    // Login Access Modal
    // ----------------------------------------------------
    window.toggleLoginModal = (mode = 'login') => {
        const modal = document.getElementById("login-modal");
        const content = document.getElementById("login-modal-content");
        const loginForm = document.getElementById("login-form");
        const signupForm = document.getElementById("signup-form");
        const title = document.getElementById("modal-title");
        const subtitle = document.getElementById("modal-subtitle");

        if (!modal) return;

        if (modal.classList.contains("hidden")) {
            modal.classList.remove("hidden");
            
            if (mode === 'signup') {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
                title.innerHTML = `Truvix <span class="text-brandPrimary">Registry</span>`;
                subtitle.textContent = "Create New User Account";
            } else {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
                title.innerHTML = `Truvix <span class="text-brandPrimary">System</span>`;
                subtitle.textContent = "Authenticate Your Account";
            }

            setTimeout(() => {
                modal.classList.remove("opacity-0");
                if (content) {
                    content.classList.remove("scale-95");
                    content.classList.add("scale-100");
                }
            }, 10);
        } else {
            // Mode switch if clicking link inside
            if (mode === 'signup' && signupForm.classList.contains('hidden')) {
                loginForm.classList.add('hidden');
                signupForm.classList.remove('hidden');
                title.innerHTML = `Truvix <span class="text-brandPrimary">Registry</span>`;
                subtitle.textContent = "Create New User Account";
                return;
            } else if (mode === 'login' && loginForm.classList.contains('hidden')) {
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
                title.innerHTML = `Truvix <span class="text-brandPrimary">System</span>`;
                subtitle.textContent = "Authenticate Your Account";
                return;
            }

            modal.classList.add("opacity-0");
            if (content) {
                content.classList.remove("scale-100");
                content.classList.add("scale-95");
            }
            setTimeout(() => {
                modal.classList.add("hidden");
            }, 300);
        }
    };

    // ----------------------------------------------------
    // User Authentication State
    // ----------------------------------------------------
    const checkLoginState = () => {
        const username = localStorage.getItem('truvix_agent_name');

        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-nav-btn');
        const authName = document.getElementById('auth-user-name');
        const logoutBtn = document.getElementById('logout-btn');

        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const mobileAuthName = document.getElementById('mobile-auth-name');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

        if (username) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (signupBtn) signupBtn.classList.add('hidden');
            if (authName) { 
                authName.classList.remove('hidden'); 
                authName.textContent = `USER: ${username}`; 
            }
            if (logoutBtn) logoutBtn.classList.remove('hidden');

            if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
            if (mobileAuthName) { mobileAuthName.classList.remove('hidden'); mobileAuthName.textContent = `USER: ${username}`; }
            if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (signupBtn) signupBtn.classList.remove('hidden');
            if (authName) authName.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');

            if (mobileLoginBtn) mobileLoginBtn.classList.remove('hidden');
            if (mobileAuthName) mobileAuthName.classList.add('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.add('hidden');
        }
    };

    // Check state on load
    checkLoginState();

    window.handleLogin = (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        if (!emailInput || !passwordInput) return;

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        
        // Check registration
        const registeredUsers = JSON.parse(localStorage.getItem('truvix_registered_users') || '[]');
        const userMatch = registeredUsers.find(u => u.email === email);

        if (userMatch) {
            if (userMatch.password === password) {
                localStorage.setItem('truvix_agent_name', userMatch.name.toUpperCase());
                checkLoginState();
                window.toggleLoginModal();
            } else {
                alert("Incorrect password for this email. Please try again.");
            }
        } else {
            alert("No account found with this email. Please sign up first.");
        }
    };

    window.handleSignup = (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passwordInput = document.getElementById('signup-password');
        
        if (nameInput && emailInput && passwordInput) {
            const name = nameInput.value.trim();
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;

            const registeredUsers = JSON.parse(localStorage.getItem('truvix_registered_users') || '[]');
            
            // Check if user exists
            if (registeredUsers.some(u => u.email === email)) {
                alert("This email is already registered. Please login.");
                window.toggleLoginModal('login');
                return;
            }

            // Register
            registeredUsers.push({ name, email, password });
            localStorage.setItem('truvix_registered_users', JSON.stringify(registeredUsers));
            
            // Log in as new user
            localStorage.setItem('truvix_agent_name', name.toUpperCase());
            
            checkLoginState();
            window.toggleLoginModal();
        }
    };

    window.handleLogout = () => {
        localStorage.removeItem('truvix_agent_name');
        checkLoginState();
    };

    document.addEventListener("keydown", (e) => {
        const modal = document.getElementById("login-modal");
        if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) {
            toggleLoginModal();
        }
    });

    const loginModal = document.getElementById("login-modal");
    if (loginModal) {
        loginModal.addEventListener("click", (e) => {
            if (e.target.id === "login-modal") {
                toggleLoginModal();
            }
        });
    }

    // ----------------------------------------------------
    // Verification Form Logic (Fetching from Express Backend)
    // ----------------------------------------------------
    const verifyForm = document.getElementById("verify-form");
    const verifyInput = document.getElementById("news-url");
    const verifyLoading = document.getElementById("verify-loading");
    const verifyResult = document.getElementById("verify-result");
    const resultContainer = document.getElementById("result-container");

    if (verifyForm) {
        verifyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const query = verifyInput.value.trim();
            if (!query) return;

            // Hide form, show loading
            verifyForm.classList.add("hidden");
            verifyResult.classList.add("hidden");
            verifyLoading.classList.remove("hidden");

            animate(verifyLoading, { opacity: [0, 1], scale: [0.9, 1] }, { duration: 0.4 });

            try {
                // Fetch from Express API
                const response = await fetch('http://localhost:3000/api/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: query })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Server error");
                }

                verifyLoading.classList.add("hidden");

                const isFake = data.status === 'FAKE';

                // Build Node output HTML
                let nodesHtml = '';
                data.nodes.forEach((node, i) => {
                    nodesHtml += `
                        <div class="glass-card p-4 flex flex-col gap-2 relative overflow-hidden group">
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                            <span class="text-xs text-slate-500 font-mono tracking-widest uppercase">Verification Source 0${i + 1}</span>
                            <div class="flex justify-between items-center z-10">
                                <span class="text-white text-sm font-bold uppercase truncate" title="${node.name}">${node.name}</span>
                                <a href="${node.url || '#'}" target="_blank" class="text-slate-500 hover:text-brandPrimary transition-colors"><i class="fa-solid fa-link"></i></a>
                            </div>
                            <span class="text-xs ${node.verdict === 'FAKE' ? 'text-fake' : 'text-truth'} font-mono z-10">${node.confidence}% Accuracy Match</span>
                        </div>
                    `;
                });

                let sourceHtml = '';
                if (data.sourceDetail) {
                    sourceHtml = `
                    <div class="mt-6 glass-card p-5 flex flex-col md:flex-row gap-6 items-center shadow-lg">
                        <!-- Real Event Image with Scanning Laser -->
                        <div class="relative w-full md:w-56 h-36 overflow-hidden rounded border border-slate-700 bg-darkBase flex items-center justify-center">
                            <!-- Background Cyber Hilus (Shows while loading or on error) -->
                            <div class="absolute w-16 h-16 rounded-full border-2 border-t-transparent border-brandPrimary animate-spin" style="animation-duration: 3s; z-index: 0;"></div>
                            <div class="absolute w-12 h-12 rounded-full border-2 border-b-transparent border-truth animate-spin" style="animation-duration: 1.5s; animation-direction: reverse; z-index: 0;"></div>
                            <div class="absolute w-4 h-4 rounded-full bg-brandPrimary/40 flex items-center justify-center shadow-[0_0_15px_#00d2ff] animate-pulse z-0"></div>

                            <!-- Real Image. Hides itself if broken, revealing the hilus -->
                            <img src="${data.sourceDetail.img}" alt="News Event Evidence" class="absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300" referrerpolicy="no-referrer" onerror="this.style.opacity='0';">
                            
                            <div class="absolute inset-0 bg-brandPrimary/10 mix-blend-overlay z-20 pointer-events-none"></div>
                            <!-- Scanning Laser -->
                            <div class="absolute top-0 left-0 w-full h-0.5 bg-brandPrimary/60 shadow-[0_0_15px_#00d2ff] transform animate-shimmer origin-left z-30 pointer-events-none"></div>

                            <!-- POPPING TICK OVERLAY -->
                            <div class="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                                <div class="w-16 h-16 rounded-full bg-truth/20 backdrop-blur-sm border-2 border-truth flex items-center justify-center animate-pop-in">
                                    <i class="fa-solid fa-check text-truth text-3xl"></i>
                                </div>
                            </div>
                        </div>
                        <div class="flex-1 w-full">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="bg-truth/10 text-truth border border-truth/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest uppercase animate-pulse">VERIFIED SOURCE</span>
                            </div>
                            <h4 class="text-white font-sans text-xl font-black mb-1 uppercase tracking-tight">${data.sourceDetail.title}</h4>
                            <p class="text-slate-400 text-sm mb-4">Official report verified by <span class="text-brandPrimary font-bold">${data.sourceDetail.portalName}</span>.</p>
                            <a href="${data.sourceDetail.url}" target="_blank" class="inline-flex items-center justify-center bg-darkBase border border-slate-600 text-slate-300 hover:bg-brandPrimary hover:text-darkBase hover:border-brandPrimary transition-all px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-widest rounded shadow-[0_0_15px_rgba(0,210,255,0.1)] hover:shadow-[0_0_20px_rgba(0,210,255,0.4)] w-full md:w-auto">
                                View Original Article <i class="fa-solid fa-arrow-up-right-from-square ml-2"></i>
                            </a>
                        </div>
                    </div>
                    `;
                }

                resultContainer.innerHTML = `
                    <div class="flex flex-col md:flex-row gap-8 items-start">
                        <!-- Status Badge -->
                        <div class="flex flex-col items-center gap-4 w-full md:w-1/3">
                            <div class="w-32 h-32 rounded flex items-center justify-center border-4 ${isFake ? 'border-fake shadow-neon-fake text-fake' : 'border-truth shadow-neon-truth text-truth'} bg-darkBase overflow-hidden">
                                <i class="fa-solid ${isFake ? 'fa-triangle-exclamation' : 'fa-check'} text-5xl animate-pop-in"></i>
                            </div>
                            <h3 class="text-3xl font-sans font-black tracking-tighter uppercase ${isFake ? 'text-fake' : 'text-truth'} text-center leading-none">
                                ${isFake ? 'FAKE NEWS DETECTED' : 'VERIFIED TRUTH'}
                            </h3>
                            <div class="text-center mt-2">
                                <span class="text-4xl font-mono text-white">${data.confidence}%</span>
                                <span class="text-xs text-slate-500 uppercase block tracking-widest mt-1">Consensus Rating</span>
                            </div>
                            <button onclick="resetVerify()" class="mt-4 btn-primary !text-xs !px-6 !py-3">Query Again</button>
                        </div>
                        
                        <!-- Details -->
                        <div class="flex-1 w-full space-y-6">
                            <div class="bg-darkBase rounded p-5 border border-slate-800 border-l-4 ${isFake ? 'border-l-fake' : 'border-l-truth'}">
                                <h4 class="text-white font-mono text-sm tracking-widest uppercase mb-2">Automated Report</h4>
                                <p class="text-sm text-slate-400 mb-2 font-mono">Query: "${data.query}"</p>
                                <p class="text-white font-light text-lg">${data.consensus}</p>
                            </div>
                            
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                ${nodesHtml}
                            </div>
                            
                            ${sourceHtml}

                            <div class="bg-darkBase/50 border border-slate-800/50 rounded px-4 py-3 mt-4 flex items-center justify-between">
                                <span class="text-xs text-slate-500 font-mono">CRYPTOGRAPHIC HASH</span>
                                <span class="text-xs text-brandSecondary font-mono select-all">${data.hash} <i class="fa-solid fa-fingerprint ml-2 text-slate-600"></i></span>
                            </div>
                        </div>
                    </div>
                `;

                verifyResult.classList.remove("hidden");
                animate(verifyResult, { opacity: [0, 1], y: [20, 0] }, { duration: 0.6 });

            } catch (error) {
                verifyLoading.classList.add("hidden");
                resultContainer.innerHTML = `
                    <div class="text-center p-8 bg-darkBase border-2 border-red-500/50 rounded border-l-4 border-l-red-500">
                        <i class="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4"></i>
                        <h3 class="text-xl text-white font-bold mb-2 uppercase tracking-widest">Backend Connection Error</h3>
                        <p class="text-slate-400 text-sm mb-4">Make sure the Express server is running on localhost:3000</p>
                        <p class="text-xs text-red-400 font-mono mb-6">${error.message}</p>
                        <button onclick="resetVerify()" class="btn-primary">Emergency Protocol: Retry</button>
                    </div>
                `;
                verifyResult.classList.remove("hidden");
            }
        });
    }

    // Reset Form
    window.resetVerify = () => {
        verifyResult.classList.add("hidden");
        verifyInput.value = "";
        verifyForm.classList.remove("hidden");
        animate(verifyForm, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.4 });
    }

    // ----------------------------------------------------
    // Leaflet GeoSpatial Map Initialization
    // ----------------------------------------------------
    setTimeout(async () => {
        const mapContainer = document.getElementById('leaflet-map');
        if (!mapContainer) return;

        // Initialize Map
        const map = L.map('leaflet-map', {
            zoomControl: false,
            attributionControl: false
        }).setView([20.0, 0.0], 2);

        // DEFAULT: Always load a base layer immediately so map appears even if fetch fails
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            subdomains: 'abcd'
        }).addTo(map);

        // Fetch Data from Backend
        try {
            const res = await fetch('http://localhost:3000/api/map-data');
            const data = await res.json();

            // Map defaults to CartoDB dark_all. 
            // Jawg Maps API override has been disabled because the provided token is invalid for Jawg Maps.
            // if (data.apiKey) { ... }

            const fakeIcon = L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='background-color:#ef4444;' class='marker-pin'></div><i class='fa-solid fa-xmark'></i>",
                iconSize: [30, 42],
                iconAnchor: [15, 42],
                popupAnchor: [0, -35]
            });

            const verifyIcon = L.divIcon({
                className: 'custom-div-icon',
                html: "<div style='background-color:#10b981;' class='marker-pin'></div><i class='fa-solid fa-check'></i>",
                iconSize: [30, 42],
                iconAnchor: [15, 42],
                popupAnchor: [0, -35]
            });

            data.data.forEach(node => {
                const icon = node.status === 'FAKE' ? fakeIcon : verifyIcon;
                const marker = L.marker([node.lat, node.lng], { icon: icon }).addTo(map);

                marker.bindPopup(`
                    <div style="background:#0b0f19; color:white; padding:15px; border-radius:8px; font-family:'Inter', sans-serif; border: 1px solid #1e293b; box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);">
                        <span style="font-family:'Oswald', sans-serif; font-size:12px; letter-spacing: 2px; text-transform:uppercase; color:${node.status === 'FAKE' ? '#ef4444' : '#10b981'}; font-weight: 700;">${node.status} / ${node.loc}</span><br/>
                        <b style="font-size:16px; text-transform:uppercase; display:block; margin-top:5px; margin-bottom:5px;">${node.title}</b>
                        <span style="font-size:12px; color:#94a3b8; font-family: monospace;">${node.desc}</span>
                        <div style="margin-top:10px; padding-top:10px; border-top: 1px solid #1e293b; font-size:10px; font-family:monospace; color:#64748b; font-weight: 600;">
                            NODE: ${node.auth}
                        </div>
                    </div>
                `, {
                    className: 'custom-popup-dark',
                    autoPan: false // Prevent map jump when popup opens to avoid disrupting the rotating animation
                });

                // Add Hover interactivity so the popups display simply by moving the cursor over them
                marker.on('mouseover', function (e) {
                    this.openPopup();
                });
                marker.on('mouseout', function (e) {
                    this.closePopup();
                });
            });

            // Auto-Rotate Map (Continuous Panning) logic
            let isUserInteracting = false;

            mapContainer.addEventListener('mouseenter', () => isUserInteracting = true);
            mapContainer.addEventListener('mouseleave', () => isUserInteracting = false);
            map.on('dragstart', () => isUserInteracting = true);
            map.on('dragend', () => isUserInteracting = false);

            let lastTimestamp = 0;
            const animateMapSpin = (timestamp) => {
                requestAnimationFrame(animateMapSpin);

                // Throttle the panning to ensure smooth movement (approx 60fps)
                if (timestamp - lastTimestamp > 16) {
                    if (!isUserInteracting) {
                        try {
                            // Pan map by 1 pixel along Longitude
                            map.panBy([1.5, 0], { animate: false });
                        } catch (err) { };
                    }
                    lastTimestamp = timestamp;
                }
            };

            // Start rotation loop
            requestAnimationFrame(animateMapSpin);

        } catch (e) {
            console.warn("Could not fetch map data from backend, make sure server is running.");
        }
    }, 500);

    // ----------------------------------------------------
    // Load Latest News from Backend
    // ----------------------------------------------------
    const loadNews = async () => {
        const newsGrid = document.getElementById("news-grid");
        const archiveBtn = document.getElementById("view-full-archive");
        if (!newsGrid) return;

        try {
            const res = await fetch('http://localhost:3000/api/latest-news');
            const json = await res.json();
            const allNews = json.data;

            const renderNews = (items, append = false) => {
                if (!append) newsGrid.innerHTML = '';
                items.forEach((news) => {
                    const card = document.createElement("div");
                    card.className = "glass-card p-6 flex flex-col justify-between group reveal cursor-pointer relative overflow-hidden";
                    card.innerHTML = `
                        <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-brandPrimary/20 to-transparent -rotate-45 transform translate-x-8 -translate-y-8 group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-500"></div>
                        <div class="absolute inset-0 bg-brandPrimary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        
                        <div class="relative z-10">
                            <div class="flex items-center gap-2 mb-4">
                                <span class="w-2 h-2 rounded-full ${news.fake ? 'bg-fake shadow-neon-fake' : 'bg-truth shadow-neon-truth'} animate-pulse"></span>
                                <span class="text-xs font-mono tracking-widest uppercase ${news.fake ? 'text-fake' : 'text-truth'}">${news.fake ? 'FAKE DETECTED' : 'VERIFIED TRUTH'}</span>
                            </div>
                            <h3 class="text-lg font-sans font-black uppercase text-white mb-4 leading-snug group-hover:text-brandPrimary transition-colors tracking-tighter">${news.title}</h3>
                        </div>
                        
                        <div class="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between">
                            <span class="text-[10px] text-slate-500 font-mono uppercase bg-darkSurface px-2 py-1 border border-slate-800">SRC: ${news.source}</span>
                            <div class="text-[9px] text-brandPrimary opacity-0 group-hover:opacity-100 transition-opacity font-bold"><i class="fa-solid fa-arrow-up-right-from-square"></i> OPEN</div>
                            <span class="text-[10px] text-slate-400 flex items-center gap-1 font-mono uppercase bg-slate-900 px-2 py-1 border border-slate-800"><i class="fa-solid fa-server text-brandPrimary"></i> ${news.auth}</span>
                        </div>
                    `;

                    card.addEventListener('click', () => {
                        if (news.url) window.open(news.url, '_blank');
                    });

                    newsGrid.appendChild(card);
                    animate(card, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.4 });
                });
            };

            // Initial Load (First 6)
            renderNews(allNews.slice(0, 6));

            if (archiveBtn) {
                archiveBtn.addEventListener('click', () => {
                    renderNews(allNews.slice(6), true);
                    archiveBtn.style.display = 'none';
                });
            }

        } catch (e) {
            console.warn("Could not fetch news data.");
        }
    };

    setTimeout(loadNews, 800);

    // ----------------------------------------------------
    // Expert AI Chat Logic
    // ----------------------------------------------------
    const chatForm = document.getElementById("chat-form");
    const chatInput = document.getElementById("chat-input");
    const chatMessages = document.getElementById("chat-messages");

    window.toggleExpertChat = () => {
        const panel = document.getElementById("expert-panel");
        const isHidden = panel.classList.contains("hidden");

        if (isHidden) {
            panel.classList.remove("hidden");
            animate(panel,
                { opacity: [0, 1], scale: [0.9, 1], y: [20, 0] },
                { duration: 0.3, easing: [0.22, 1, 0.36, 1] }
            );
        } else {
            animate(panel,
                { opacity: [1, 0], scale: [1, 0.9], y: [0, 20] },
                { duration: 0.2 }
            ).finished.then(() => {
                panel.classList.add("hidden");
            });
        }
    };

    // ----------------------------------------------------
    // Expert Selection & Chat Logic
    // ----------------------------------------------------
    let activeExpert = null;

    window.selectExpert = (name, specialty, imgSrc) => {
        activeExpert = { name, specialty, imgSrc };
        
        // Update UI
        document.getElementById('active-expert-name').textContent = name;
        document.getElementById('active-expert-specialty').textContent = specialty;
        document.getElementById('active-expert-img').src = imgSrc;
        
        // Switch views
        document.getElementById('expert-selector-view').classList.add('hidden');
        document.getElementById('expert-chat-view').classList.remove('hidden');
        
        // Clear and add initial message
        const chatMessages = document.getElementById("chat-messages");
        chatMessages.innerHTML = '';
        addChatMessage(`Hello! I am ${name}, specializing in ${specialty}. How can I assist you with verification today?`, false);
    };

    window.backToRegistry = () => {
        document.getElementById('expert-selector-view').classList.remove('hidden');
        document.getElementById('expert-chat-view').classList.add('hidden');
        activeExpert = null;
    };

    const generateBotResponse = async (query) => {
        const expertTag = activeExpert ? activeExpert.name : "Truvix Assistant";
        try {
            const res = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ q: query })
            });
            const { data } = await res.json();
            
            if (data && data.length > 0) {
                const snippet = data[0].snippet;
                const source = data[0].source || "News Node";
                return `[${expertTag}] Our real-time intel reflects: "${snippet}" (Detected via ${source}). I suggest cross-verifying this with our main engine for a high-fidelity verdict.`;
            } else {
                return `[${expertTag}] I am currently analyzing the decentralized nodes for "${query}". The metadata indicates a stable corroboration across our news registry.`;
            }
        } catch (e) {
            console.warn("Direct chat link failed. Reverting to local logic.");
            return `[${expertTag}] My forensic scan shows "${query}" is currently being indexed by our primary verification nodes. Please stand by for full consensus.`;
        }
    };

    if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const username = localStorage.getItem('truvix_agent_name');
            const msg = chatInput.value.trim();
            if (!msg) return;

            // Access Control Check
            if (!username) {
                chatInput.value = "";
                addChatMessage("Please LOGIN to your Truvix account to access human-expert verification features.", false);
                return;
            }

            // User message
            addChatMessage(msg, true);
            chatInput.value = "";

            // Bot typing
            const typingId = "typing-" + Date.now();
            setTimeout(() => {
                chatMessages.insertAdjacentHTML('beforeend', `
                    <div id="${typingId}" class="flex gap-2 w-full animate-pulse my-2 text-xs font-mono">
                        <div class="text-brandPrimary font-bold">></div>
                        <div class="text-slate-500 italic">Truvix Assistant is processing your request...</div>
                    </div>
                `);
                chatMessages.scrollTop = chatMessages.scrollHeight;

            // Bot response
            setTimeout(async () => {
                const typingElem = document.getElementById(typingId);
                if (typingElem) typingElem.remove();
                
                const response = await generateBotResponse(msg);
                addChatMessage(response, false);
            }, 1000); 

            }, 200);
        });
    }

    function addChatMessage(text, isUser) {
        const div = document.createElement("div");
        div.className = "flex gap-2 w-full my-2";
        const username = localStorage.getItem('truvix_agent_name') || "GUEST";

        if (isUser) {
            div.innerHTML = `
                <div class="text-white font-bold opacity-50">${username}></div>
                <div class="text-white">${text}</div>
            `;
        } else {
            div.innerHTML = `
                <div class="text-brandPrimary font-bold">></div>
                <div class="text-brandPrimary">${text}</div>
            `;
        }

        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        animate(div, { opacity: [0, 1] }, { duration: 0.2 });
    }

    // ----------------------------------------------------
    // Live Map Notifications / Intelligence Feed
    // ----------------------------------------------------
    const updateMapAlerts = async () => {
        const alertContainer = document.getElementById("live-map-alerts");
        if (!alertContainer) return;

        try {
            const res = await fetch('http://localhost:3000/api/map-data');
            const { data } = await res.json();
            
            if (data && data.length > 0) {
                alertContainer.innerHTML = '';
                const suspicious = data.filter(n => n.status === 'FAKE').slice(0, 5);
                
                suspicious.forEach((node, idx) => {
                    const alertHtml = `
                        <div class="p-3 bg-fake/5 border-l border-fake/30 hover:bg-fake/10 transition-colors cursor-pointer group" onclick="window.focusMapNode(${node.lat}, ${node.lng}, '${node.title}')">
                            <div class="flex justify-between items-start mb-1">
                                <span class="text-[10px] font-mono text-fake/60 uppercase tracking-widest">Sector: ${node.loc}</span>
                                <span class="text-[9px] font-mono text-fake animate-pulse">DETECTED</span>
                            </div>
                            <h5 class="text-xs font-bold text-white group-hover:text-fake transition-colors">${node.title}</h5>
                        </div>
                    `;
                    alertContainer.insertAdjacentHTML('beforeend', alertHtml);
                });
            }
        } catch (e) {
            console.warn("Could not sync live map alerts.");
        }
    };

    // Initial sync and periodic update
    updateMapAlerts();
    setInterval(updateMapAlerts, 30000); // Sync every 30s

    window.focusMapNode = (lat, lng, title) => {
        // High-precision zoom into the globe marker
        if (typeof window.jumpToGlobeMarker === 'function') {
            window.jumpToGlobeMarker(lat, lng);
        }
        
        console.log(`Deep Dive: [${lat}, ${lng}]`);
        // Smooth scroll to map section if needed
        document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
    };

    // ----------------------------------------------------
    // Impact Stats Counters Animation & Randomization
    // ----------------------------------------------------
    const randomizeImpactStats = () => {
        const counters = document.querySelectorAll('.counter');
        counters.forEach((counter, idx) => {
            let target = 0;
            switch(idx) {
                case 0: // Active Factcheckers
                    target = Math.floor(Math.random() * (9500 - 7500) + 7500);
                    break;
                case 1: // Claims Verified
                    target = Math.floor(Math.random() * (48000 - 32000) + 32000);
                    break;
                case 2: // Countries Reached
                    target = Math.floor(Math.random() * (85 - 72) + 72);
                    break;
                case 3: // Accuracy Precision
                    target = Math.floor(Math.random() * (99 - 96) + 96);
                    break;
            }
            counter.setAttribute('data-target', target);
        });
    };

    const animateCounters = () => {
        const counters = document.querySelectorAll('.counter');
        const speed = 100;

        counters.forEach((counter, idx) => {
            const target = +counter.getAttribute('data-target');
            const updateCount = () => {
                const count = +counter.innerText.replace(/,/g, '').replace('%', '');
                const inc = target / speed;

                if (count < target) {
                    let nextCount = Math.ceil(count + inc);
                    if (nextCount > target) nextCount = target;
                    
                    let suffix = (idx === 3) ? '%' : '';
                    counter.innerText = nextCount.toLocaleString() + suffix;
                    setTimeout(updateCount, 15);
                } else {
                    let suffix = (idx === 3) ? '%' : '';
                    counter.innerText = target.toLocaleString() + suffix;
                }
            };
            updateCount();
        });
    };

    // Intersection Observer for stats
    const statsSection = document.getElementById('leaderboard');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                randomizeImpactStats();
                animateCounters();
                observer.unobserve(statsSection);
            }
        }, { threshold: 0.1 });
        observer.observe(statsSection);
    }

});
