// ============================================
// CONFIGURATION
// ============================================
const TARGET_DATE = new Date('February 13, 2026 22:17:00').getTime();
const GAME_DURATION = 30; // seconds
const TARGET_SCORE = 15;
const HEART_EMOJIS = ['❤️', '💖', '💗', '💕', '💓', '🩷', '💘'];
const DECOY_EMOJIS = ['💔', '🖤', '🩶'];

// ============================================
// PHASE 1: COUNTDOWN
// ============================================
let countdownInterval;

function updateCountdown() {
    const now = new Date().getTime();
    const gap = TARGET_DATE - now;

    if (gap <= 0) {
        clearInterval(countdownInterval);
        startTransition();
        return;
    }

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = Math.floor(gap / day);
    const hours = Math.floor((gap % day) / hour);
    const minutes = Math.floor((gap % hour) / minute);
    const seconds = Math.floor((gap % minute) / second);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
}

// Declare heartInterval early so startTransition can safely clear it
let heartInterval = null;

// If the target date has already passed, skip countdown and go straight to transition
if (Date.now() >= TARGET_DATE) {
    document.getElementById('countdown-section').style.display = 'none';
    startTransition();
} else {
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown();
    heartInterval = setInterval(createHeart, 500);
}

// ============================================
// FLOATING HEARTS (Background)
// ============================================
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    heart.style.left = Math.random() * 100 + 'vw';
    const size = Math.random() * 20 + 10 + 'px';
    heart.style.width = size;
    heart.style.height = size;
    heart.style.animationDuration = Math.random() * 5 + 10 + 's';
    document.getElementById('background-animation').appendChild(heart);
    setTimeout(() => heart.remove(), 15000);
}

// heartInterval is now initialized above, before the if/else check

// ============================================
// PHASE 2: TRANSITION
// ============================================
function startTransition() {
    clearInterval(heartInterval);
    const countdownSection = document.getElementById('countdown-section');
    countdownSection.style.transition = 'all 1s ease-out';
    countdownSection.style.opacity = '0';
    countdownSection.style.transform = 'scale(0.8)';

    setTimeout(() => {
        countdownSection.style.display = 'none';
        const overlay = document.getElementById('transition-overlay');
        overlay.classList.add('active');
    }, 1000);

    document.getElementById('play-btn').addEventListener('click', startGame);
}

// ============================================
// PHASE 3: GAME — "Catch My Love"
// ============================================
let score = 0;
let gameTimerValue = GAME_DURATION;
let gameActive = false;
let gameTimerInterval;
let heartSpawnInterval;

function startGame() {
    // Hide transition, show game
    document.getElementById('transition-overlay').classList.remove('active');
    document.getElementById('transition-overlay').style.display = 'none';

    const gameSection = document.getElementById('game-section');
    gameSection.classList.add('active');

    // Reset
    score = 0;
    gameTimerValue = GAME_DURATION;
    gameActive = true;
    updateScoreDisplay();
    document.getElementById('game-timer').innerText = gameTimerValue;

    // Start spawning hearts
    heartSpawnInterval = setInterval(spawnGameItem, 800);

    // Start game timer
    gameTimerInterval = setInterval(() => {
        gameTimerValue--;
        document.getElementById('game-timer').innerText = gameTimerValue;

        if (gameTimerValue <= 0) {
            endGame(false);
        }
    }, 1000);
}

function spawnGameItem() {
    if (!gameActive) return;

    const arena = document.getElementById('game-arena');
    const arenaRect = arena.getBoundingClientRect();

    // 75% chance heart, 25% chance decoy
    const isHeart = Math.random() > 0.25;

    const item = document.createElement('div');
    item.className = isHeart ? 'game-heart' : 'game-decoy';

    if (isHeart) {
        item.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
    } else {
        item.textContent = DECOY_EMOJIS[Math.floor(Math.random() * DECOY_EMOJIS.length)];
    }

    // Random horizontal position
    const maxLeft = arenaRect.width - 50;
    item.style.left = Math.random() * maxLeft + 'px';
    item.style.top = '-60px';

    // Click handler
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isHeart) {
            catchHeart(item, e);
        } else {
            hitDecoy(item, e);
        }
    });

    arena.appendChild(item);

    // Animate falling
    const fallDuration = 3000 + Math.random() * 2000; // 3-5 seconds
    const startTime = Date.now();
    const arenaHeight = arenaRect.height;

    function fall() {
        if (!gameActive) {
            item.remove();
            return;
        }
        const elapsed = Date.now() - startTime;
        const progress = elapsed / fallDuration;

        if (progress >= 1) {
            item.remove();
            return;
        }

        // Add a gentle horizontal sway
        const sway = Math.sin(elapsed / 300) * 20;
        const currentLeft = parseFloat(item.style.left);
        item.style.top = (progress * arenaHeight) + 'px';
        item.style.transform = `translateX(${sway}px)`;

        requestAnimationFrame(fall);
    }

    requestAnimationFrame(fall);
}

function catchHeart(element, event) {
    if (!gameActive) return;

    score++;
    updateScoreDisplay();

    // Visual feedback
    element.classList.add('caught');

    // Score popup
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+1 💖';
    popup.style.left = element.style.left;
    popup.style.top = element.style.top;
    document.getElementById('game-arena').appendChild(popup);

    setTimeout(() => {
        element.remove();
        popup.remove();
    }, 800);

    // Check win condition
    if (score >= TARGET_SCORE) {
        endGame(true);
    }
}

function hitDecoy(element, event) {
    if (!gameActive) return;

    // Lose a point but not below 0
    score = Math.max(0, score - 1);
    updateScoreDisplay();

    element.classList.add('hit');

    // Negative popup
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '-1 💔';
    popup.style.color = '#ff4444';
    popup.style.left = element.style.left;
    popup.style.top = element.style.top;
    document.getElementById('game-arena').appendChild(popup);

    setTimeout(() => {
        element.remove();
        popup.remove();
    }, 600);
}

function updateScoreDisplay() {
    document.getElementById('score').innerText = score;
    const progress = Math.min((score / TARGET_SCORE) * 100, 100);
    document.getElementById('love-progress-fill').style.width = progress + '%';
}

function endGame(won) {
    gameActive = false;
    clearInterval(gameTimerInterval);
    clearInterval(heartSpawnInterval);

    // Clear remaining game items
    const arena = document.getElementById('game-arena');

    if (won) {
        // Short delay then reveal
        setTimeout(() => {
            document.getElementById('game-section').classList.remove('active');
            document.getElementById('game-section').style.display = 'none';
            showReveal();
        }, 800);
    } else {
        // Time's up — give them another chance with a friendly message
        arena.innerHTML = '';
        const retry = document.createElement('div');
        retry.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:white;';
        retry.innerHTML = `
            <h2 style="font-family:'Dancing Script',cursive;font-size:2rem;color:#ff8fa3;margin-bottom:1rem;">Almost there! 💕</h2>
            <p style="font-size:1.1rem;color:rgba(255,255,255,0.7);margin-bottom:1.5rem;">You collected ${score} hearts! Try once more...</p>
            <button onclick="retryGame()" style="padding:12px 40px;font-size:1.1rem;font-family:'Poppins',sans-serif;font-weight:600;border:none;border-radius:50px;background:linear-gradient(135deg,#ffd700,#ff6b81);color:#590d22;cursor:pointer;transition:transform 0.3s ease;box-shadow:0 5px 25px rgba(255,215,0,0.4);">Try Again 💪</button>
        `;
        arena.appendChild(retry);
    }
}

function retryGame() {
    const arena = document.getElementById('game-arena');
    arena.innerHTML = '';
    score = 0;
    gameTimerValue = GAME_DURATION;
    gameActive = true;
    updateScoreDisplay();
    document.getElementById('game-timer').innerText = gameTimerValue;

    heartSpawnInterval = setInterval(spawnGameItem, 800);
    gameTimerInterval = setInterval(() => {
        gameTimerValue--;
        document.getElementById('game-timer').innerText = gameTimerValue;
        if (gameTimerValue <= 0) endGame(false);
    }, 1000);
}

// ============================================
// PHASE 4: SURPRISE REVEAL
// ============================================
function showReveal() {
    const reveal = document.getElementById('reveal-section');
    reveal.classList.add('active');

    // Dynamic background style
    document.body.style.background = 'linear-gradient(135deg, #0d0015, #1a0a2e)';

    // Start confetti
    launchConfetti();
}

function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const colors = ['#ff4d6d', '#ffd700', '#ff8fa3', '#ffffff', '#c9184a', '#ffaa00', '#ee9ca7'];

    function createConfettiPiece() {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.width = Math.random() * 10 + 5 + 'px';
        piece.style.height = Math.random() * 10 + 5 + 'px';
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.animationDuration = Math.random() * 3 + 2 + 's';
        piece.style.animationDelay = Math.random() * 0.5 + 's';
        canvas.appendChild(piece);

        setTimeout(() => piece.remove(), 5500);
    }

    // Initial burst
    for (let i = 0; i < 60; i++) {
        setTimeout(() => createConfettiPiece(), i * 30);
    }

    // Continuous gentle confetti
    setInterval(() => {
        for (let i = 0; i < 5; i++) {
            createConfettiPiece();
        }
    }, 400);
}

// ============================================
// DEV/TESTING: Skip countdown for testing
// Uncomment the line below to skip directly to the transition
// ============================================
// setTimeout(startTransition, 1000);
