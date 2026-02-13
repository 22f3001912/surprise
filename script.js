function updateCountdown() {
    const targetDate = new Date('February 14, 2026 00:00:00').getTime();
    const now = new Date().getTime();
    const gap = targetDate - now;

    if (gap < 0) {
        document.querySelector('.container').innerHTML = '<h1>Happy Valentine\'s Day!</h1><p class="message">The wait is over! ❤️</p>';
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

    document.getElementById('days').innerText = days < 10 ? '0' + days : days;
    document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
    document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown(); // Initial call to avoid 1s delay

// Floating Hearts Animation Config
function createHeart() {
    const heart = document.createElement('div');
    heart.classList.add('heart');
    
    // Random position
    heart.style.left = Math.random() * 100 + 'vw';
    
    // Random size
    const size = Math.random() * 20 + 10 + 'px';
    heart.style.width = size;
    heart.style.height = size;
    
    // Random animation duration
    heart.style.animationDuration = Math.random() * 5 + 10 + 's'; // 10-15s
    
    document.getElementById('background-animation').appendChild(heart);
    
    // Remove heart after animation
    setTimeout(() => {
        heart.remove();
    }, 15000);
}

setInterval(createHeart, 500); // Create a new heart every 500ms
