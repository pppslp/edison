const canvas = document.getElementById('lightning-canvas');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Lightning {
    constructor(x1, y1, x2, y2, color, thickness) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color || 'rgba(255, 255, 200, 0.8)';
        this.thickness = thickness || 3;
        this.opacity = 1;
        this.branches = [];
        this.points = this.createLine(x1, y1, x2, y2);
    }

    createLine(x1, y1, x2, y2) {
        const points = [];
        const dist = Math.hypot(x2 - x1, y2 - y1);
        const segments = Math.max(5, Math.floor(dist / 20));

        points.push({ x: x1, y: y1 });

        for (let i = 1; i < segments; i++) {
            const ratio = i / segments;
            const tx = x1 + (x2 - x1) * ratio;
            const ty = y1 + (y2 - y1) * ratio;

            // Add jitter
            const offset = (Math.random() - 0.5) * 50;
            points.push({
                x: tx + offset,
                y: ty + offset
            });

            // Chance to create a branch
            if (Math.random() < 0.1) {
                this.branches.push(this.createLine(
                    tx + offset,
                    ty + offset,
                    tx + offset + (Math.random() - 0.5) * 200,
                    ty + offset + (Math.random() - 0.5) * 200
                ));
            }
        }

        points.push({ x: x2, y: y2 });
        return points;
    }

    draw(context) {
        if (this.opacity <= 0) return;

        context.save();
        context.strokeStyle = this.color;
        context.lineWidth = this.thickness;
        context.shadowBlur = 20;
        context.shadowColor = 'white';
        context.globalAlpha = this.opacity;

        const drawPath = (pts) => {
            context.beginPath();
            context.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) {
                context.lineTo(pts[i].x, pts[i].y);
            }
            context.stroke();
        };

        drawPath(this.points);
        this.branches.forEach(drawPath);

        context.restore();

        this.opacity -= 0.05;
        this.thickness *= 0.95;
    }
}

let activeLightnings = [];

function createBolt(x, y) {
    // Bolts coming from dynamic corners/edges
    const origins = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height },
        { x: width / 2, y: 0 },
        { x: width / 2, y: height }
    ];

    // Pick 2-3 random origins for massive effect
    for (let i = 0; i < 3; i++) {
        const start = origins[Math.floor(Math.random() * origins.length)];
        activeLightnings.push(new Lightning(start.x, start.y, x, y, 'rgba(100, 200, 255, 0.9)', 5));
    }

    // Add one direct hit bolt
    activeLightnings.push(new Lightning(x, 0, x, y, 'rgba(255, 255, 255, 1)', 8));
}

function animate() {
    ctx.clearRect(0, 0, width, height);

    activeLightnings = activeLightnings.filter(l => l.opacity > 0);
    activeLightnings.forEach(l => l.draw(ctx));

    requestAnimationFrame(animate);
}

animate();

// LANDING PORTAL LOGIC
const portal = document.getElementById('landing-portal');
const portalCards = document.querySelectorAll('.portal-card');

if (portal) {
    portalCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const url = card.getAttribute('data-url');
            
            // Zap effect on click
            createBolt(e.clientX, e.clientY);

            // Zoom In Animation before redirect
            portal.classList.add('zoomed');
            
            setTimeout(() => {
                window.location.href = url;
            }, 800); 
        });
    });
}

// BACK LINK LOGIC (ZOOM OUT)
const backLinks = document.querySelectorAll('.back-link');
backLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const url = link.getAttribute('href');

        createBolt(e.clientX, e.clientY);
        document.body.classList.add('zoom-out-ani');

        setTimeout(() => {
            window.location.href = url;
        }, 800);
    });
});

// INTERACTIVITY
window.addEventListener('mousedown', (e) => {
    // Only bolts if not clicking portal cards (handled separately)
    if (!e.target.closest('.portal-card')) {
        createBolt(e.clientX, e.clientY);
        document.body.style.transform = `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 10}px)`;
        setTimeout(() => document.body.style.transform = 'translate(0,0)', 100);
    }
});

// Automatic effect on page load (slides)
window.addEventListener('load', () => {
    if (!portal) {
        setTimeout(() => {
            createBolt(width / 2, height / 2);
        }, 500);
    }
});

// FULLSCREEN
window.addEventListener('dblclick', (e) => {
    if (e.target.closest('.portal-card')) return;

    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error: ${err.message}`);
        });
        createBolt(width / 2, height / 2);
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
});

console.log("Sistema Edison Multi-Page: ⚡ Portal Conectado ⚡");
