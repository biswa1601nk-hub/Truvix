// particles.js - Enhanced Constellation Effect

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas-particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let w, h, particles;
    let mouse = {
        x: null,
        y: null,
        radius: 150
    };

    function resizeReset() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        init();
    }

    window.addEventListener("resize", resizeReset);
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener("mouseout", () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            
            // Depth simulation: 0 to 1
            this.z = Math.random();
            
            this.size = (this.z * 2) + 0.5; // Near particles are larger
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            
            // Speed scaled by depth
            this.speedX = ((Math.random() * 0.6) - 0.3) * (this.z + 0.5);
            this.speedY = ((Math.random() * 0.6) - 0.3) * (this.z + 0.5);
            
            // Colors: Cyan for distant (smaller), Violet for near (larger)
            this.color = this.z > 0.6 ? '#8b5cf6' : '#0ea5e9';
        }

        update() {
            // Autonomous drift
            this.x += this.speedX;
            this.y += this.speedY;

            // Simple bounce bounds
            if (this.x > w || this.x < 0) this.speedX *= -1;
            if (this.y > h || this.y < 0) this.speedY *= -1;

            // Mouse Interaction (Push)
            if (mouse.x != undefined && mouse.y != undefined) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = dx / distance;
                    const directionY = dy / distance;
                    this.x -= directionX * force * 5;
                    this.y -= directionY * force * 5;
                }
            }
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Subtle glow for large/near particles
            if (this.z > 0.8) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    function init() {
        particles = [];
        const count = Math.floor((w * h) / 15000); // Dynamic density
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connect() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                // Max distance for connection
                let maxDist = 200;
                
                if (distance < maxDist) {
                    let opacity = 1 - (distance / maxDist);
                    // Connection strength also depends on depth similarity
                    let zDiff = 1 - Math.abs(particles[a].z - particles[b].z);
                    opacity *= zDiff * 0.4;

                    ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
                    ctx.lineWidth = 0.3 * zDiff;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connect();
        requestAnimationFrame(animate);
    }

    resizeReset();
    animate();
});

