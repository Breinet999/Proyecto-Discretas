const TILE_SIZE = 32;

// Configuramos un mapa más grande (20 columnas x 14 filas)
const MAP_COLS = 42;
const MAP_ROWS = 22;

let map = [];
let currentLevel = 1;

const canvas = document.getElementById("game");

// JavaScript calcula el tamaño interno real (1344 x 704)
canvas.width = MAP_COLS * TILE_SIZE;  
canvas.height = MAP_ROWS * TILE_SIZE; 
const ctx = canvas.getContext("2d");

// Entidades del juego
const player = { x: 1, y: 1 };
const killer = { x: 0, y: 0 };
const exit = { x: 0, y: 0 };

// ==========================================
// 1. GENERADOR DE MAPA ALEATORIO Y DINÁMICO
// ==========================================
function generateRandomMap() {
    let newMap = [];

    for (let y = 0; y < MAP_ROWS; y++) {
        let row = [];
        for (let x = 0; x < MAP_COLS; x++) {
            // Si es el borde exterior, SIEMPRE es pared (1)
            if (y === 0 || y === MAP_ROWS - 1 || x === 0 || x === MAP_COLS - 1) {
                row.push(1);
            } 
            // Si es la esquina superior izquierda (donde nace el jugador), SIEMPRE es suelo (0)
            else if (y <= 2 && x <= 2) {
                row.push(0);
            } 
            // Para el resto del mapa, hay un 22% de probabilidad de generar una pared
            else {
                row.push(Math.random() < 0.22 ? 1 : 0);
            }
        }
        newMap.push(row);
    }

    return newMap;
}

// Inicializa o reinicia un nivel completo
function startLevel() {
    map = generateRandomMap();

    // Posicionar al jugador al inicio
    player.x = 1;
    player.y = 1;

    // Posicionar la Salida (2) en la esquina inferior derecha (buscando un suelo libre)
    exit.x = MAP_COLS - 2;
    exit.y = MAP_ROWS - 2;
    while (map[exit.y][exit.x] === 1) {
        exit.x--; // Si hay una pared ahí, la movemos a la izquierda hasta hallar suelo
    }

    // Posicionar al Asesino lejos del jugador (ej: cerca de la salida)
    killer.x = exit.x - 1;
    killer.y = exit.y;
    if(map[killer.y][killer.x] === 1) map[killer.y][killer.x] = 0; // Asegurar suelo para el asesino

    drawMap();
}

// ==========================================
// 2. RENDERIZADO (DIBUJO)
// ==========================================
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fondo oscuro del canvas
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const posX = x * TILE_SIZE;
            const posY = y * TILE_SIZE;

            if (map[y][x] === 1) {
                // Paredes oscuras con borde rojo tenue
                ctx.fillStyle = "#242424";
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

                ctx.strokeStyle = "rgba(139, 0, 0, 0.28)";
                ctx.lineWidth = 1;
                ctx.strokeRect(posX + 0.5, posY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
            } else {
                // Suelo oscuro, más integrado con el fondo
                ctx.fillStyle = "rgba(5, 5, 5, 0.38)";
                ctx.fillRect(posX, posY, TILE_SIZE, TILE_SIZE);

                ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
                ctx.lineWidth = 1;
                ctx.strokeRect(posX + 0.5, posY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
            }
        }
    }

    // Dibujar la salida
    ctx.shadowColor = "rgba(46, 204, 113, 0.8)";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#1f8f4d";
    ctx.fillRect(
        exit.x * TILE_SIZE + 5,
        exit.y * TILE_SIZE + 5,
        TILE_SIZE - 10,
        TILE_SIZE - 10
    );
    ctx.shadowBlur = 0;

    // Dibujar jugador
    ctx.shadowColor = "rgba(212, 200, 168, 0.85)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#d4c8a8";
    ctx.fillRect(
        player.x * TILE_SIZE + 4,
        player.y * TILE_SIZE + 4,
        TILE_SIZE - 8,
        TILE_SIZE - 8
    );
    ctx.shadowBlur = 0;

    // Dibujar asesino
    ctx.shadowColor = "rgba(255, 0, 0, 0.9)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#8b0000";
    ctx.fillRect(
        killer.x * TILE_SIZE + 4,
        killer.y * TILE_SIZE + 4,
        TILE_SIZE - 8,
        TILE_SIZE - 8
    );
    ctx.shadowBlur = 0;

    // Texto de nivel
    ctx.fillStyle = "#d4c8a8";
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.shadowColor = "rgba(139, 0, 0, 0.9)";
    ctx.shadowBlur = 8;
    ctx.fillText(`Nivel: ${currentLevel}`, 15, 28);
    ctx.shadowBlur = 0;
}

// ==========================================
// 3. MOVIMIENTO Y LOGICA
// ==========================================
document.addEventListener("keydown", (e) => {
    let nextX = player.x;
    let nextY = player.y;

    if (e.key === "w" || e.key === "ArrowUp") nextY--;
    if (e.key === "s" || e.key === "ArrowDown") nextY++;
    if (e.key === "a" || e.key === "ArrowLeft") nextX--;
    if (e.key === "d" || e.key === "ArrowRight") nextX++;

    if (map[nextY] && map[nextY][nextX] !== 1) {
        player.x = nextX;
        player.y = nextY;
    }

    checkCollisions();
    drawMap();
});

// Comprobar si ganaste o perdiste
function checkCollisions() {
    // Caso 1: El asesino atrapa al jugador (Derrota)
    if (player.x === killer.x && player.y === killer.y) {
        setTimeout(() => {
            alert(`¡Game Over! Llegaste hasta el nivel ${currentLevel}`);
            currentLevel = 1;
            startLevel();
        }, 10);
    }
    
    // Caso 2: El jugador llega a la salida verde (Siguiente Nivel)
    if (player.x === exit.x && player.y === exit.y) {
        setTimeout(() => {
            alert("¡Nivel Completado! Cargando siguiente zona...");
            currentLevel++;
            startLevel(); // Genera un arreglo totalmente nuevo y reubica todo
        }, 10);
    }
}

// ==========================================
// 4. INTELIGENCIA DE MOVIMIENTO (BFS)
// ==========================================
function findNextStep(start, target) {
    if (start.x === target.x && start.y === target.y) return start;

    const queue = [ [start] ];
    const visited = new Set();
    visited.add(`${start.x},${start.y}`);

    const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];

    while (queue.length > 0) {
        const path = queue.shift();
        const current = path[path.length - 1];

        if (current.x === target.x && current.y === target.y) {
            return path[1]; 
        }

        for (const dir of directions) {
            const nextX = current.x + dir.x;
            const nextY = current.y + dir.y;
            const key = `${nextX},${nextY}`;

            if (map[nextY] && map[nextY][nextX] !== 1 && !visited.has(key)) {
                visited.add(key);
                queue.push([...path, { x: nextX, y: nextY }]);
            }
        }
    }
    return start; 
}

// Bucle de movimiento del asesino
setInterval(() => {
    const nextStep = findNextStep({ x: killer.x, y: killer.y }, { x: player.x, y: player.y });
    killer.x = nextStep.x;
    killer.y = nextStep.y;

    drawMap();
    checkCollisions();
}, 450); // Un poco más rápido para compensar el mapa grande

// Ejecución inicial
startLevel();


// control de audio
const audio = new Audio("../sounds/ambient.mp3");
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

// agregados 
// efecto de linterna 
const flashlight = document.querySelector('.flashlight');

document.addEventListener('mousemove', (e) => {
    flashlight.style.background = `radial-gradient(
        circle 400px at ${e.clientX}px ${e.clientY}px,
        transparent 0%,
        rgba(0, 0, 0, 0.75) 100%
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
