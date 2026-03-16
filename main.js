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
    // Login Access Modal
    // ----------------------------------------------------
    window.toggleLoginModal = () => {
        const modal = document.getElementById("login-modal");
        const content = document.getElementById("login-modal-content");
        if (!modal) return;

        if (modal.classList.contains("hidden")) {
            modal.classList.remove("hidden");
            setTimeout(() => {
                modal.classList.remove("opacity-0");
                if (content) {
                    content.classList.remove("scale-95");
                    content.classList.add("scale-100");
                }
            }, 10);
        } else {
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
        const authName = document.getElementById('auth-user-name');
        const logoutBtn = document.getElementById('logout-btn');

        const mobileLoginBtn = document.getElementById('mobile-login-btn');
        const mobileAuthName = document.getElementById('mobile-auth-name');
        const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

        if (username) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (authName) { authName.classList.remove('hidden'); authName.textContent = username; }
            if (logoutBtn) logoutBtn.classList.remove('hidden');

            if (mobileLoginBtn) mobileLoginBtn.classList.add('hidden');
            if (mobileAuthName) { mobileAuthName.classList.remove('hidden'); mobileAuthName.textContent = username; }
            if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
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
        const nameInput = document.getElementById('login-name');
        if (nameInput && nameInput.value.trim() !== '') {
            localStorage.setItem('truvix_agent_name', nameInput.value.trim());
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
                            <span class="text-xs text-slate-500 font-mono tracking-widest">VERIFICATION NODE 0${i + 1}</span>
                            <div class="flex justify-between items-center z-10">
                                <span class="text-white text-sm font-bold uppercase truncate" title="${node.name}">${node.name}</span>
                                <a href="${node.url || '#'}" target="_blank" class="text-slate-500 hover:text-brandPrimary transition-colors"><i class="fa-solid fa-link"></i></a>
                            </div>
                            <span class="text-xs ${node.verdict === 'FAKE' ? 'text-fake' : 'text-truth'} font-mono z-10">${node.confidence}% Confidence</span>
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
        if (!newsGrid) return;

        try {
            const res = await fetch('http://localhost:3000/api/latest-news');
            const json = await res.json();

            json.data.forEach((news) => {
                const card = document.createElement("div");
                card.className = "glass-card p-6 flex flex-col justify-between group reveal cursor-pointer";
                card.innerHTML = `
                    <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-brandPrimary/20 to-transparent -rotate-45 transform translate-x-8 -translate-y-8"></div>
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <span class="w-2 h-2 rounded-full ${news.fake ? 'bg-fake shadow-neon-fake' : 'bg-truth shadow-neon-truth'} animate-pulse"></span>
                            <span class="text-xs font-mono tracking-widest uppercase ${news.fake ? 'text-fake' : 'text-truth'}">${news.fake ? 'FAKE DETECTED' : 'VERIFIED TRUTH'}</span>
                        </div>
                        <h3 class="text-xl font-sans font-black uppercase text-white mb-4 leading-snug group-hover:text-brandPrimary transition-colors tracking-tighter">${news.title}</h3>
                    </div>
                    
                    <div class="pt-4 border-t border-slate-800 flex items-center justify-between">
                        <span class="text-xs text-slate-500 font-mono uppercase bg-darkSurface px-2 py-1 border border-slate-800">SRC: ${news.source}</span>
                        <span class="text-xs text-slate-400 flex items-center gap-1 font-mono uppercase bg-slate-900 px-2 py-1 border border-slate-800"><i class="fa-solid fa-server text-brandPrimary"></i> ${news.auth}</span>
                    </div>
                `;
                newsGrid.appendChild(card);
            });
        } catch (e) {
            console.warn("Could not fetch news data from backend, make sure server is running.");
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

    if (chatForm) {
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (!msg) return;

            // User message
            addChatMessage(msg, true);
            chatInput.value = "";

            // Bot typing
            const typingId = "typing-" + Date.now();
            setTimeout(() => {
                chatMessages.insertAdjacentHTML('beforeend', `
                    <div id="${typingId}" class="flex gap-2 w-full animate-pulse my-2">
                        <div class="text-brandPrimary font-bold">></div>
                        <div class="text-slate-400 italic">Fact-checking algorithm running...</div>
                    </div>
                `);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // Bot response
                setTimeout(() => {
                    document.getElementById(typingId).remove();
                    addChatMessage(`We are currently scanning HT & ToI nodes for consensus regarding your request. Initial indices suggest the need for multi-point verification.`, false);
                }, 1200);

            }, 300);
        });
    }

    function addChatMessage(text, isUser) {
        const div = document.createElement("div");
        div.className = "flex gap-2 w-full my-2";

        if (isUser) {
            div.innerHTML = `
                <div class="text-white font-bold opacity-50">USR></div>
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

});
