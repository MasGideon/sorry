/* 
   =========================================
   CUTE APOLOGY WEBSITE - JAVASCRIPT ENGINE
   ========================================= 
*/

document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let currentSlide = 1;
    const totalSlides = 5;
    let isSoundMuted = false;
    let dodgeCount = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    // DOM Elements
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const soundToggleBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    const themeBtn = document.getElementById('theme-btn');
    const editNameBtn = document.getElementById('edit-name-btn');
    const recipientDisplay = document.getElementById('recipient-name-display');

    // Modals
    const victoryModal = document.getElementById('victory-modal');
    const editModal = document.getElementById('edit-modal');
    const themeModal = document.getElementById('theme-modal');
    const nameInput = document.getElementById('name-input');
    const saveNameBtn = document.getElementById('save-name-btn');
    const cancelNameBtn = document.getElementById('cancel-name-btn');
    const closeThemeBtn = document.getElementById('close-theme-btn');
    const replayBtn = document.getElementById('replay-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Interactive Buttons
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const noBtnText = document.getElementById('no-btn-text');
    const healHeartBtn = document.getElementById('heal-heart-btn');
    const healText = document.getElementById('heal-text');

    /* ----------------------------------------------------
       1. WEB AUDIO SYNTHESIZER (No external assets needed!)
       ---------------------------------------------------- */
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playPopSound(freq = 520, type = 'sine', duration = 0.15) {
        if (isSoundMuted) return;
        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio fail fallback
        }
    }

    function playFanfare() {
        if (isSoundMuted) return;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                playPopSound(freq, 'triangle', 0.3);
            }, idx * 120);
        });
    }

    // Mute / Unmute Sound
    soundToggleBtn.addEventListener('click', () => {
        isSoundMuted = !isSoundMuted;
        soundIcon.textContent = isSoundMuted ? '🔇' : '🔊';
        if (!isSoundMuted) playPopSound(600);
    });

    /* ----------------------------------------------------
       2. SLIDE NAVIGATION DECK
       ---------------------------------------------------- */
    function updateSlidePosition() {
        slides.forEach((slide) => {
            const slideNum = parseInt(slide.getAttribute('data-slide'));
            slide.classList.toggle('active', slideNum === currentSlide);
        });

        dots.forEach((dot) => {
            const dotIndex = parseInt(dot.getAttribute('data-index'));
            dot.classList.toggle('active', dotIndex === currentSlide);
        });

        // Button States
        prevBtn.disabled = currentSlide === 1;
        if (currentSlide === totalSlides) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'flex';
        }
    }

    function goToSlide(targetIndex) {
        if (targetIndex < 1 || targetIndex > totalSlides) return;
        currentSlide = targetIndex;
        updateSlidePosition();
        playPopSound(440 + currentSlide * 60);
    }

    function nextSlide() {
        if (currentSlide < totalSlides) {
            goToSlide(currentSlide + 1);
        }
    }

    function prevSlide() {
        if (currentSlide > 1) {
            goToSlide(currentSlide - 1);
        }
    }

    // Next/Prev Buttons
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);

    // Dynamic "Next" buttons inside slides
    document.querySelectorAll('.next-slide-btn').forEach(btn => {
        btn.addEventListener('click', nextSlide);
    });

    // Pagination Dot Clicks
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            goToSlide(index);
        });
    });

    // Keyboard Arrow Controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'Space') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });

    // Touch Swipe Navigation for Mobile
    const cardDeck = document.querySelector('.card-glass');
    cardDeck.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    cardDeck.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const threshold = 50;
        if (touchEndX < touchStartX - threshold) {
            nextSlide(); // Swipe left -> next
        }
        if (touchEndX > touchStartX + threshold) {
            prevSlide(); // Swipe right -> prev
        }
    }

    /* ----------------------------------------------------
       3. INTERACTIVE FEATURES & DODGING BUTTON
       ---------------------------------------------------- */
    
    // Slide 2: Heal Heart Interaction
    if (healHeartBtn) {
        healHeartBtn.addEventListener('click', () => {
            healHeartBtn.classList.add('healed');
            healText.textContent = 'Heart Mended & Healed! ❤️‍🩹';
            playPopSound(750, 'sine', 0.25);
            triggerMiniBurst(healHeartBtn);
        });
    }

    // Slide 3: Reason Cards Flip
    document.querySelectorAll('.reason-card').forEach(card => {
        const toggleFlip = () => {
            card.classList.toggle('flipped');
            playPopSound(card.classList.contains('flipped') ? 640 : 480);
        };
        card.addEventListener('click', toggleFlip);
        card.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleFlip();
        });
    });

    // Slide 4: Promises Checklist
    document.querySelectorAll('.promise-item').forEach(item => {
        const toggleCheck = () => {
            item.classList.toggle('checked');
            playPopSound(item.classList.contains('checked') ? 700 : 350);
        };
        item.addEventListener('click', toggleCheck);
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleCheck();
        });
    });

    // Slide 5: Playful Dodging "No" Button
    const noBtnPhrases = [
        "No 😜",
        "Are you sure? 🥺",
        "Pretty please? 🌸",
        "Nice try! 😋",
        "Think again! 💖",
        "Almost had it! 😜",
        "Okay fine, YES! 💕"
    ];

    function dodgeNoButton() {
        dodgeCount++;
        playPopSound(300 + dodgeCount * 50, 'triangle', 0.1);

        if (dodgeCount >= noBtnPhrases.length - 1) {
            // Convert No button into YES!
            noBtn.className = 'btn-success btn-pop';
            noBtnText.textContent = "YES! Of course 💕";
            noBtn.style.transform = 'none';
            noBtn.removeEventListener('mouseover', dodgeNoButton);
            noBtn.removeEventListener('touchstart', dodgeNoButton);
            noBtn.addEventListener('click', triggerVictory);
            return;
        }

        // Update Text
        noBtnText.textContent = noBtnPhrases[dodgeCount];

        // Calculate Random Escape Vector inside container
        const container = document.getElementById('decision-area');
        const containerRect = container.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();

        const maxX = (containerRect.width / 2) - (btnRect.width / 2) - 10;
        const maxY = (containerRect.height / 2) - (btnRect.height / 2) - 10;

        const randomX = (Math.random() * 2 - 1) * maxX;
        const randomY = (Math.random() * 2 - 1) * maxY;
        const randomRotate = (Math.random() * 30 - 15);

        noBtn.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg) scale(0.92)`;
    }

    noBtn.addEventListener('mouseover', dodgeNoButton);
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        dodgeNoButton();
    });

    // Slide 5: YES Button Trigger
    yesBtn.addEventListener('click', triggerVictory);

    function triggerVictory() {
        playFanfare();
        startConfetti();
        victoryModal.classList.add('active');
    }

    // Victory Modal Action Buttons
    replayBtn.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        dodgeCount = 0;
        noBtn.className = 'btn-dodge';
        noBtnText.textContent = "No 😜";
        noBtn.style.transform = 'none';
        goToSlide(1);
    });

    closeModalBtn.addEventListener('click', () => {
        victoryModal.classList.remove('active');
        startConfetti();
    });

    /* ----------------------------------------------------
       4. PERSONALIZATION & THEME PICKER
       ---------------------------------------------------- */
    // Load Saved Recipient Name
    const savedName = localStorage.getItem('apology_recipient');
    if (savedName) {
        recipientDisplay.textContent = savedName;
    }

    editNameBtn.addEventListener('click', () => {
        nameInput.value = recipientDisplay.textContent;
        editModal.classList.add('active');
    });

    cancelNameBtn.addEventListener('click', () => {
        editModal.classList.remove('active');
    });

    saveNameBtn.addEventListener('click', () => {
        const val = nameInput.value.trim();
        if (val) {
            recipientDisplay.textContent = val;
            localStorage.setItem('apology_recipient', val);
        }
        editModal.classList.remove('active');
        playPopSound(600);
    });

    // Theme Picker Modal
    themeBtn.addEventListener('click', () => {
        themeModal.classList.add('active');
    });

    closeThemeBtn.addEventListener('click', () => {
        themeModal.classList.remove('active');
    });

    document.querySelectorAll('.theme-option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const themeClass = btn.getAttribute('data-theme');
            document.body.className = themeClass;
            document.querySelectorAll('.theme-option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('apology_theme', themeClass);
            playPopSound(550);
        });
    });

    // Restore saved theme
    const savedTheme = localStorage.getItem('apology_theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        document.querySelectorAll('.theme-option-btn').forEach(b => {
            b.classList.toggle('active', b.getAttribute('data-theme') === savedTheme);
        });
    }

    /* ----------------------------------------------------
       5. PARTICLES & CONFETTI CANVAS
       ---------------------------------------------------- */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let confetti = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Floating Watermark Text Particle ("sorryyyyy sweeetyyyy")
    class TextWatermark {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + Math.random() * 100;
            this.speedY = Math.random() * 0.7 + 0.3;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.4;
            this.opacity = Math.random() * 0.18 + 0.12; // Soft subtle watermark
            this.text = ["sorryyyyy sweeetyyyy 💕", "sorryyyyy sweeetyyyy 🥺", "sorryyyyy sweeetyyyy 🌸"][Math.floor(Math.random() * 3)];
            this.fontSize = Math.floor(Math.random() * 6 + 18);
            this.rotation = -15 + (Math.random() * 10);
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            if (this.y < -50) this.reset();
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.font = `700 ${this.fontSize}px 'Fredoka', cursive, sans-serif`;
            ctx.fillStyle = `rgba(255, 77, 109, ${this.opacity})`;
            ctx.fillText(this.text, 0, 0);
            ctx.restore();
        }
    }

    // Floating Ambient Background Particles (Hearts & Sparkles)
    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height + 20;
            this.size = Math.random() * 14 + 8;
            this.speedY = Math.random() * 1.2 + 0.4;
            this.speedX = Math.sin(Math.random() * Math.PI) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.type = Math.random() > 0.4 ? 'heart' : 'sparkle';
            this.rotation = Math.random() * 360;
        }
        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            this.rotation += 0.5;
            if (this.y < -30) this.reset();
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;

            if (this.type === 'heart') {
                ctx.fillStyle = '#FF758F';
                ctx.beginPath();
                const topCurveHeight = this.size * 0.3;
                ctx.moveTo(0, topCurveHeight);
                ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
                ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
                ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
                ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
                ctx.fill();
            } else {
                ctx.fillStyle = '#FFD166';
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Confetti Explosion Piece
    class Confetti {
        constructor() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.size = Math.random() * 10 + 6;
            this.speedX = (Math.random() - 0.5) * 16;
            this.speedY = (Math.random() - 0.7) * 16;
            this.gravity = 0.25;
            this.color = ['#FF4D6D', '#FFD166', '#06D6A0', '#118AB2', '#70D6FF', '#FF8FA3'][Math.floor(Math.random() * 6)];
            this.opacity = 1;
            this.rotation = Math.random() * 360;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.speedY += this.gravity;
            this.opacity -= 0.008;
            this.rotation += 4;
        }
        draw() {
            if (this.opacity <= 0) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(this.opacity, 0);
            ctx.fillStyle = this.color;
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            ctx.restore();
        }
    }

    // Initialize background particles & text watermarks
    for (let i = 0; i < 20; i++) {
        const p = new Particle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
    }
    for (let i = 0; i < 14; i++) {
        const tw = new TextWatermark();
        tw.y = Math.random() * canvas.height;
        particles.push(tw);
    }

    function startConfetti() {
        for (let i = 0; i < 120; i++) {
            confetti.push(new Confetti());
        }
    }

    function triggerMiniBurst(element) {
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < 30; i++) {
            const c = new Confetti();
            c.x = rect.left + rect.width / 2;
            c.y = rect.top + rect.height / 2;
            c.speedX = (Math.random() - 0.5) * 8;
            c.speedY = (Math.random() - 0.5) * 8;
            confetti.push(c);
        }
    }

    // Main Canvas Render Loop
    function renderCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render ambient particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Render confetti
        confetti.forEach((c, index) => {
            c.update();
            c.draw();
            if (c.opacity <= 0 || c.y > canvas.height + 50) {
                confetti.splice(index, 1);
            }
        });

        requestAnimationFrame(renderCanvas);
    }

    renderCanvas();
});
