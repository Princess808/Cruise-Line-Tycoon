// Game state
const gameState = {
    money: 1000,
    passengers: 0,
    reputation: 50,
    ships: [],
    lastShipId: 0,
    waveOffset: 0,
    gameTime: 0,
    passiveIncomeInterval: null
};

// DOM elements
const startScreen = document.getElementById('start-screen');
const howToPlayScreen = document.getElementById('how-to-play-screen');
const gameScreen = document.getElementById('game-screen');
const startBtn = document.getElementById('start-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const backBtn = document.getElementById('back-btn');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const moneyDisplay = document.getElementById('money');
const passengersDisplay = document.getElementById('passengers');
const reputationDisplay = document.getElementById('reputation');
const buyShipBtn = document.getElementById('buy-ship');
const upgradeShipBtn = document.getElementById('upgrade-ship');
const advertiseBtn = document.getElementById('advertise');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Event listeners for screen navigation
startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    startGame();
});

howToPlayBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    howToPlayScreen.classList.remove('hidden');
});

backBtn.addEventListener('click', () => {
    howToPlayScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

// Game functions
function startGame() {
    // Start passive income
    gameState.passiveIncomeInterval = setInterval(() => {
        const income = gameState.ships.reduce((sum, ship) => sum + ship.passengers * ship.level, 0);
        gameState.money += income;
        gameState.passengers = gameState.ships.reduce((sum, ship) => sum + ship.passengers, 0);
        updateUI();
    }, 1000);

    // Start game loop
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update game time
    gameState.gameTime = timestamp / 1000;
    gameState.waveOffset = Math.sin(gameState.gameTime) * 10;
    
    // Draw ocean background
    drawOcean();
    
    // Draw ships
    gameState.ships.forEach(ship => {
        drawShip(ship);
    });
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

function drawOcean() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0077be');
    gradient.addColorStop(1, '#00a1ff');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 20) {
            const waveHeight = Math.sin(x / 100 + gameState.gameTime) * 10 + gameState.waveOffset;
            if (x === 0) {
                ctx.moveTo(x, y + waveHeight);
            } else {
                ctx.lineTo(x, y + waveHeight);
            }
        }
        ctx.stroke();
    }
    
    // Sun
    ctx.fillStyle = 'rgba(255, 255, 100, 0.3)';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 100, 50, 0, Math.PI * 2);
    ctx.fill();
}

function drawShip(ship) {
    const shipHeight = 60 + ship.level * 10;
    const shipWidth = 100 + ship.level * 15;
    const deckHeight = shipHeight * 0.3;
    
    // Ship hull
    ctx.fillStyle = ship.color || '#fff';
    ctx.beginPath();
    ctx.moveTo(ship.x, ship.y);
    ctx.lineTo(ship.x + shipWidth * 0.7, ship.y);
    ctx.lineTo(ship.x + shipWidth, ship.y - shipHeight * 0.7);
    ctx.lineTo(ship.x + shipWidth * 0.7, ship.y - shipHeight);
    ctx.lineTo(ship.x, ship.y - shipHeight);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Ship decks
    for (let i = 0; i < ship.level; i++) {
        const deckY = ship.y - shipHeight + (deckHeight * i);
        ctx.fillStyle = '#ddd';
        ctx.fillRect(ship.x + 10, deckY, shipWidth - 20, deckHeight - 5);
        ctx.strokeRect(ship.x + 10, deckY, shipWidth - 20, deckHeight - 5);
        
        // Windows
        ctx.fillStyle = '#aaf';
        const windowCount = 5 + i * 2;
        for (let j = 0; j < windowCount; j++) {
            const windowX = ship.x + 20 + (j * (shipWidth - 40) / windowCount);
            ctx.beginPath();
            ctx.arc(windowX, deckY + deckHeight / 2, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Ship smoke
    ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
    for (let i = 0; i < 3; i++) {
        const smokeX = ship.x + shipWidth * 0.8;
        const smokeY = ship.y - shipHeight + (i * 10) + Math.sin(gameState.gameTime * 2 + i) * 5;
        const smokeSize = 10 + i * 5 + Math.sin(gameState.gameTime + i) * 5;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, smokeSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Ship info
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText(`Lvl ${ship.level}`, ship.x + 10, ship.y - shipHeight - 5);
    ctx.fillText(`${ship.passengers} passengers`, ship.x + 10, ship.y - shipHeight - 20);
}

function addShip(x, y) {
    if (gameState.money < 500) return false;
    
    gameState.money -= 500;
    gameState.lastShipId++;
    
    const ship = {
        id: gameState.lastShipId,
        x: x,
        y: y,
        level: 1,
        passengers: Math.floor(Math.random() * 10) + 5,
        color: `hsl(${Math.random() * 360}, 70%, 70%)`
    };
    
    gameState.ships.push(ship);
    updateUI();
    return true;
}

function upgradeRandomShip() {
    if (gameState.money < 300 || gameState.ships.length === 0) return false;
    
    gameState.money -= 300;
    const randomIndex = Math.floor(Math.random() * gameState.ships.length);
    const ship = gameState.ships[randomIndex];
    
    ship.level++;
    ship.passengers += Math.floor(Math.random() * 10) + 5;
    
    // Increase reputation for upgrades
    gameState.reputation = Math.min(100, gameState.reputation + 2);
    
    updateUI();
    return true;
}

function advertise() {
    if (gameState.money < 200) return false;
    
    gameState.money -= 200;
    gameState.reputation = Math.min(100, gameState.reputation + 5);
    
    // Add passengers to all ships
    gameState.ships.forEach(ship => {
        ship.passengers += Math.floor(Math.random() * 5) + 1;
    });
    
    updateUI();
    return true;
}

function updateUI() {
    moneyDisplay.textContent = gameState.money;
    passengersDisplay.textContent = gameState.passengers;
    reputationDisplay.textContent = gameState.reputation;
    
    // Update button states
    buyShipBtn.disabled = gameState.money < 500;
    upgradeShipBtn.disabled = gameState.money < 300 || gameState.ships.length === 0;
    advertiseBtn.disabled = gameState.money < 200;
    
    // Update button texts
    buyShipBtn.textContent = `Buy Cruise Ship ($${500})`;
    upgradeShipBtn.textContent = `Upgrade Ship ($${300})`;
    advertiseBtn.textContent = `Advertise ($${200})`;
}

// Event listeners for game controls
buyShipBtn.addEventListener('click', () => {
    // Add ship at random position
    const x = canvas.width * 0.2 + Math.random() * (canvas.width * 0.6);
    const y = canvas.height * 0.7 + Math.random() * (canvas.height * 0.2);
    addShip(x, y);
});

upgradeShipBtn.addEventListener('click', upgradeRandomShip);
advertiseBtn.addEventListener('click', advertise);

// Click on canvas to add ships
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only allow clicks in the lower part of the screen (ocean)
    if (y > canvas.height * 0.6) {
        addShip(x, y);
    }
});

// Initialize UI
updateUI();