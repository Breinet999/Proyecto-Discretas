// audio control

const audio = new Audio("./sounds/ambient.mp3");
audio.loop = true;
audio.volume = 0.2;

const btn = document.getElementById('btn-sound');
const icon = btn.querySelector('i');

btn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        icon.className = 'fa-solid fa-volume-high';
    } else {
        audio.pause();
        icon.className = 'fa-solid fa-volume-xmark';
    }
});

// efecto de linterna 
const flashlight = document.querySelector('.flashlight');

document.addEventListener('mousemove', (e) => {
    flashlight.style.background = `radial-gradient(
        circle 400px at ${e.clientX}px ${e.clientY}px,
        transparent 0%,
        rgba(0, 0, 0, 0.92) 100%
    )`;
});

// parpadeo
setInterval(() => {
    if (Math.random() > 0.85) {
        flashlight.style.opacity = '0';
        setTimeout(() => {
            flashlight.style.opacity = '1';
        }, 100);
    }
}, 300);
