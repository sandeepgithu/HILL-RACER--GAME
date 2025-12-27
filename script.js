
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state
let gameActive = false;
let gamePaused = false;
let gameOver = false;

// Vehicle configurations
const vehicleTypes = {
    jeep: {
        name: 'Jeep',
        maxSpeed: 12,
        acceleration: 0.25,
        fuelCapacity: 100,
        fuelConsumption: 0.08,
        width: 80,
        height: 50,
        color: '#E74C3C',
        accentColor: '#C0392B',
        wheelColor: '#2C3E50',
        price: 0, // Starting vehicle - free
        locked: false
    },
    bike: {
        name: 'Bike',
        maxSpeed: 18,
        acceleration: 0.4,
        fuelCapacity: 80,
        fuelConsumption: 0.12,
        width: 65,
        height: 45,
        color: '#3498DB',
        accentColor: '#2980B9',
        wheelColor: '#2C3E50',
        price: 1000,
        locked: true
    },
    truck: {
        name: 'Truck',
        maxSpeed: 8,
        acceleration: 0.18,
        fuelCapacity: 150,
        fuelConsumption: 0.06,
        width: 95,
        height: 60,
        color: '#F39C12',
        accentColor: '#E67E22',
        wheelColor: '#34495E',
        price: 1000,
        locked: true
    },
    supercar: {
        name: 'Super Car',
        maxSpeed: 22,
        acceleration: 0.5,
        fuelCapacity: 90,
        fuelConsumption: 0.15,
        width: 85,
        height: 45,
        color: '#E91E63',
        accentColor: '#C2185B',
        wheelColor: '#1A1A1A',
        price: 1000,
        locked: true
    },
    monster: {
        name: 'Monster Truck',
        maxSpeed: 10,
        acceleration: 0.22,
        fuelCapacity: 180,
        fuelConsumption: 0.05,
        width: 100,
        height: 70,
        color: '#4CAF50',
        accentColor: '#388E3C',
        wheelColor: '#1B5E20',
        price: 1000,
        locked: true
    },
    racer: {
        name: 'Racing Car',
        maxSpeed: 20,
        acceleration: 0.45,
        fuelCapacity: 85,
        fuelConsumption: 0.13,
        width: 82,
        height: 42,
        color: '#FF5722',
        accentColor: '#E64A19',
        wheelColor: '#212121',
        price: 1000,
        locked: true
    }
};

let selectedVehicleType = 'jeep';

// Track owned vehicles
let ownedVehicles = ['jeep']; // Start with jeep unlocked

// Vehicle upgrades
let upgrades = {
    engine: 1,
    fuel: 1,
    grip: 1
};

// Vehicle object
let vehicle = {
    x: 150,
    y: 400,
    speed: 0,
    rotation: 0,
    velocityY: 0,
    gravity: 0.5,
    fuel: 100,
    maxFuel: 100,
    onGround: false,
    wheelRotation: 0
};

// Stats
let distance = 0;
let coinsCollected = 0;
let totalCoins = 0;
let topSpeed = 0;
let currentSpeed = 0;

// Terrain and coins
let terrain = [];
let terrainOffset = 0;
const terrainSegmentWidth = 30;
let coins = [];
let fuelCans = [];
let lastTerrainX = 0; // Track the last generated terrain point
let lastCoinCheck = 0; // Track last position we checked for coin generation
let lastFuelCheck = 0; // Track last position we checked for fuel generation

// Particles
let particles = [];

// Controls
let gasPressed = false;
let brakePressed = false;
let jumpPressed = false;
let downPressed = false;

// Initialize vehicle with selected type
function initVehicle() {
    const type = vehicleTypes[selectedVehicleType];
    vehicle = {
        x: 150,
        y: 400,
        width: type.width,
        height: type.height,
        speed: 0,
        maxSpeed: type.maxSpeed + (upgrades.engine - 1) * 2,
        acceleration: type.acceleration + (upgrades.engine - 1) * 0.05,
        rotation: 0,
        velocityY: 0,
        gravity: 0.5,
        fuel: type.fuelCapacity + (upgrades.fuel - 1) * 20,
        maxFuel: type.fuelCapacity + (upgrades.fuel - 1) * 20,
        fuelConsumption: type.fuelConsumption * (1 - (upgrades.fuel - 1) * 0.1),
        onGround: false,
        color: type.color,
        accentColor: type.accentColor,
        wheelColor: type.wheelColor,
        grip: 0.99 - (upgrades.grip - 1) * 0.005,
        wheelRotation: 0,
        type: selectedVehicleType
    };
}

// Generate terrain
function generateTerrain() {
    terrain = [];
    let y = canvas.height - 250;
    
    for (let x = 0; x < canvas.width * 4; x += terrainSegmentWidth) {
        const variation = Math.sin(x * 0.01) * 80 + Math.random() * 40 - 20;
        y += variation * 0.1;
        y = Math.max(canvas.height - 500, Math.min(canvas.height - 100, y));
        
        terrain.push({ x, y });
    }
    
    lastTerrainX = terrain[terrain.length - 1].x;
}

// Generate more terrain as player progresses
function generateMoreTerrain() {
    if (terrain.length === 0) return;
    
    let lastPoint = terrain[terrain.length - 1];
    let y = lastPoint.y;
    
    // Generate 50 new segments ahead
    for (let i = 0; i < 50; i++) {
        lastTerrainX += terrainSegmentWidth;
        const variation = Math.sin(lastTerrainX * 0.01) * 80 + Math.random() * 40 - 20;
        y += variation * 0.1;
        y = Math.max(canvas.height - 500, Math.min(canvas.height - 100, y));
        
        terrain.push({ x: lastTerrainX, y });
    }
    
    // Remove old terrain segments that are far behind
    while (terrain.length > 0 && terrain[0].x < terrainOffset - canvas.width) {
        terrain.shift();
    }
}

// Generate more coins as player progresses
function generateMoreCoins() {
    const currentPos = terrainOffset;
    
    // Generate coins ahead of the player
    if (currentPos > lastCoinCheck) {
        lastCoinCheck = currentPos;
        
        // Find terrain points ahead
        for (let i = 0; i < terrain.length; i++) {
            const terrainPoint = terrain[i];
            
            // Only generate for terrain ahead of player
            if (terrainPoint.x > currentPos + canvas.width && terrainPoint.x < currentPos + canvas.width * 2) {
                if (Math.random() > 0.6 && i % 6 === 0) {
                    // Check if coin already exists at this position
                    const existingCoin = coins.find(c => Math.abs(c.x - terrainPoint.x) < 100);
                    if (!existingCoin) {
                        coins.push({
                            x: terrainPoint.x + Math.random() * 100 - 50,
                            y: terrainPoint.y - 30 - Math.random() * 20,
                            radius: 18,
                            collected: false,
                            rotation: 0,
                            pulse: 0
                        });
                    }
                }
            }
        }
    }
    
    // Remove collected coins that are far behind
    coins = coins.filter(coin => !coin.collected || coin.x > terrainOffset - canvas.width);
}

// Generate more fuel cans as player progresses
function generateMoreFuel() {
    const currentPos = terrainOffset;
    
    // Generate fuel ahead of the player
    if (currentPos > lastFuelCheck + 300) { // Check every 300 units
        lastFuelCheck = currentPos;
        
        // Find terrain points ahead
        for (let i = 0; i < terrain.length; i++) {
            const terrainPoint = terrain[i];
            
            // Only generate for terrain ahead of player
            if (terrainPoint.x > currentPos + canvas.width && terrainPoint.x < currentPos + canvas.width * 2) {
                if (Math.random() > 0.85 && i % 30 === 0) {
                    // Check if fuel already exists at this position
                    const existingFuel = fuelCans.find(f => Math.abs(f.x - terrainPoint.x) < 200);
                    if (!existingFuel) {
                        fuelCans.push({
                            x: terrainPoint.x,
                            y: terrainPoint.y - 70,
                            width: 30,
                            height: 40,
                            collected: false
                        });
                    }
                }
            }
        }
    }
    
    // Remove collected fuel that is far behind
    fuelCans = fuelCans.filter(fuel => !fuel.collected || fuel.x > terrainOffset - canvas.width);
}

// Generate coins
function generateCoins() {
    coins = [];
    for (let i = 0; i < terrain.length; i += 6) {
        if (Math.random() > 0.4) {
            coins.push({
                x: terrain[i].x + Math.random() * 100 - 50,
                y: terrain[i].y - 30 - Math.random() * 20, // Moved closer to ground
                radius: 18,
                collected: false,
                rotation: 0,
                pulse: 0
            });
        }
    }
}

// Generate fuel cans
function generateFuelCans() {
    fuelCans = [];
    for (let i = 0; i < terrain.length; i += 30) {
        if (Math.random() > 0.7) {
            fuelCans.push({
                x: terrain[i].x,
                y: terrain[i].y - 70,
                width: 30,
                height: 40,
                collected: false
            });
        }
    }
}

// Get terrain height at x position
function getTerrainHeight(x) {
    const adjustedX = x + terrainOffset;
    
    for (let i = 0; i < terrain.length - 1; i++) {
        if (adjustedX >= terrain[i].x && adjustedX <= terrain[i + 1].x) {
            const t = (adjustedX - terrain[i].x) / (terrain[i + 1].x - terrain[i].x);
            return terrain[i].y + (terrain[i + 1].y - terrain[i].y) * t;
        }
    }
    return canvas.height - 200;
}

// Draw sky with sun/moon
function drawSky() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#B0D9F1');
    gradient.addColorStop(0.7, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
    
    // Sun
    const sunX = 150 - (terrainOffset * 0.05) % (canvas.width + 300);
    ctx.beginPath();
    ctx.arc(sunX, 100, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD700';
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#FFD700';
    ctx.fill();
    ctx.shadowBlur = 0;
}

// Draw clouds
function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 8; i++) {
        const x = ((terrainOffset * 0.3) + i * 250) % (canvas.width + 300) - 150;
        const y = 80 + Math.sin(i) * 100;
        
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 45, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 38, 0, Math.PI * 2);
        ctx.arc(x + 25, y - 20, 30, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw terrain
function drawTerrain() {
    // Ground
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    
    for (let point of terrain) {
        ctx.lineTo(point.x - terrainOffset, point.y);
    }
    
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
    
    // Grass layer
    ctx.strokeStyle = '#228B22';
    ctx.lineWidth = 6;
    ctx.beginPath();
    let first = true;
    for (let point of terrain) {
        const x = point.x - terrainOffset;
        if (x < -100 || x > canvas.width + 100) continue;
        
        if (first) {
            ctx.moveTo(x, point.y);
            first = false;
        } else {
            ctx.lineTo(x, point.y);
        }
    }
    ctx.stroke();
    
    // Decorative grass
    ctx.strokeStyle = '#2ECC71';
    ctx.lineWidth = 2;
    for (let i = 0; i < terrain.length; i += 2) {
        const x = terrain[i].x - terrainOffset;
        const y = terrain[i].y;
        
        if (x < -100 || x > canvas.width + 100) continue;
        
        for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.moveTo(x + j * 5, y);
            ctx.lineTo(x + j * 5 - 3, y - 12);
            ctx.stroke();
        }
    }
}

// Draw detailed vehicle
function drawVehicle() {
    ctx.save();
    
    // Update wheel rotation based on speed
    vehicle.wheelRotation += vehicle.speed * 0.3;
    
    // Warning glow if about to flip
    const rotationDanger = Math.abs(vehicle.rotation) / (Math.PI / 2.2);
    if (rotationDanger > 0.7) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = `rgba(255, 50, 50, ${(rotationDanger - 0.7) * 3})`;
    }
    
    // Draw shadow first (beneath everything)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.translate(vehicle.x + vehicle.width / 2, vehicle.y + vehicle.height + 15);
    ctx.scale(1, 0.3);
    ctx.beginPath();
    ctx.ellipse(0, 0, vehicle.width * 0.6, vehicle.height * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    
    // Draw wheels first (behind body)
    const wheelRadius = vehicle.height * 0.4;
    const wheelPositions = [
        { x: vehicle.x + vehicle.width * 0.25, y: vehicle.y + vehicle.height + 5 },
        { x: vehicle.x + vehicle.width * 0.75, y: vehicle.y + vehicle.height + 5 }
    ];
    
    ctx.translate(vehicle.x + vehicle.width / 2, vehicle.y + vehicle.height / 2);
    ctx.rotate(vehicle.rotation);
    ctx.translate(-(vehicle.x + vehicle.width / 2), -(vehicle.y + vehicle.height / 2));
    
    for (let i = 0; i < wheelPositions.length; i++) {
        const pos = wheelPositions[i];
        drawWheel(pos.x, pos.y, wheelRadius);
    }
    
    // Draw vehicle body
    const bodyX = vehicle.x;
    const bodyY = vehicle.y;
    
    if (vehicle.type === 'jeep') {
        drawJeep(bodyX, bodyY, vehicle.width, vehicle.height);
    } else if (vehicle.type === 'bike') {
        drawBike(bodyX, bodyY, vehicle.width, vehicle.height);
    } else if (vehicle.type === 'truck') {
        drawTruck(bodyX, bodyY, vehicle.width, vehicle.height);
    } else if (vehicle.type === 'supercar') {
        drawSupercar(bodyX, bodyY, vehicle.width, vehicle.height);
    } else if (vehicle.type === 'monster') {
        drawMonster(bodyX, bodyY, vehicle.width, vehicle.height);
    } else if (vehicle.type === 'racer') {
        drawRacer(bodyX, bodyY, vehicle.width, vehicle.height);
    }
    
    ctx.restore();
    
    // Exhaust particles when accelerating
    if (gasPressed && vehicle.fuel > 0 && Math.random() > 0.6) {
        const exhaustX = vehicle.x - vehicle.width / 2 + Math.cos(vehicle.rotation) * 10;
        const exhaustY = vehicle.y + vehicle.height / 2 + Math.sin(vehicle.rotation) * 10;
        
        particles.push({
            x: exhaustX,
            y: exhaustY,
            vx: -Math.random() * 4 - vehicle.speed * 0.3,
            vy: Math.random() * 3 - 1.5,
            life: 25,
            maxLife: 25,
            size: Math.random() * 6 + 4,
            color: `rgba(100, 100, 100, ${Math.random() * 0.5 + 0.3})`
        });
    }
}

// Draw wheel
function drawWheel(x, y, radius) {
    // Tire outer
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = vehicle.wheelColor;
    ctx.fill();
    
    // Tire inner shadow
    ctx.beginPath();
    ctx.arc(x, y, radius - 3, 0, Math.PI * 2);
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();
    
    // Rim
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = '#95A5A6';
    ctx.fill();
    
    // Rim center
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#7F8C8D';
    ctx.fill();
    
    // Spokes
    ctx.strokeStyle = '#BDC3C7';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2 / 6) + vehicle.wheelRotation;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * radius * 0.3, y + Math.sin(angle) * radius * 0.3);
        ctx.lineTo(x + Math.cos(angle) * radius * 0.6, y + Math.sin(angle) * radius * 0.6);
        ctx.stroke();
    }
    
    // Highlight
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
}

// Draw Jeep
function drawJeep(x, y, width, height) {
    // Main body
    ctx.fillStyle = vehicle.color;
    ctx.fillRect(x, y, width, height);
    
    // Darker bottom
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x, y + height * 0.6, width, height * 0.4);
    
    // Windshield
    ctx.fillStyle = 'rgba(100, 180, 220, 0.7)';
    ctx.fillRect(x + width * 0.1, y + height * 0.1, width * 0.35, height * 0.45);
    
    // Side window
    ctx.fillRect(x + width * 0.55, y + height * 0.15, width * 0.35, height * 0.35);
    
    // Roof rack
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    ctx.strokeRect(x + width * 0.05, y - 5, width * 0.9, 5);
    
    // Door line
    ctx.strokeStyle = vehicle.accentColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.5, y + height * 0.2);
    ctx.lineTo(x + width * 0.5, y + height);
    ctx.stroke();
    
    // Headlight
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(x + width * 0.92, y + height * 0.4, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Taillight
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(x + width * 0.05, y + height * 0.5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Body highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, width, height * 0.15);
}

// Draw Bike
function drawBike(x, y, width, height) {
    // Main frame
    ctx.strokeStyle = vehicle.color;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Frame triangle
    ctx.beginPath();
    ctx.moveTo(x + width * 0.3, y + height);
    ctx.lineTo(x + width * 0.5, y + height * 0.2);
    ctx.lineTo(x + width * 0.7, y + height);
    ctx.stroke();
    
    // Seat post
    ctx.beginPath();
    ctx.moveTo(x + width * 0.4, y + height * 0.3);
    ctx.lineTo(x + width * 0.4, y + height * 0.5);
    ctx.stroke();
    
    // Handle bars
    ctx.beginPath();
    ctx.moveTo(x + width * 0.5, y + height * 0.2);
    ctx.lineTo(x + width * 0.65, y);
    ctx.stroke();
    
    // Seat
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.ellipse(x + width * 0.35, y + height * 0.3, 15, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Engine block
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x + width * 0.35, y + height * 0.55, width * 0.3, height * 0.25);
    
    // Exhaust pipe
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.5, y + height * 0.75);
    ctx.lineTo(x + width * 0.2, y + height * 0.85);
    ctx.stroke();
    
    // Headlight
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(x + width * 0.75, y + height * 0.15, 7, 0, Math.PI * 2);
    ctx.fill();
}

// Draw Truck
function drawTruck(x, y, width, height) {
    // Cargo bed
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x, y + height * 0.2, width * 0.55, height * 0.8);
    
    // Cargo bed detail lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x + (width * 0.55 * i / 4), y + height * 0.2);
        ctx.lineTo(x + (width * 0.55 * i / 4), y + height);
        ctx.stroke();
    }
    
    // Cab
    ctx.fillStyle = vehicle.color;
    ctx.fillRect(x + width * 0.55, y, width * 0.45, height);
    
    // Cab bottom darker section
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x + width * 0.55, y + height * 0.6, width * 0.45, height * 0.4);
    
    // Windshield
    ctx.fillStyle = 'rgba(100, 180, 220, 0.7)';
    ctx.fillRect(x + width * 0.6, y + height * 0.1, width * 0.35, height * 0.45);
    
    // Windshield divider
    ctx.strokeStyle = vehicle.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.78, y + height * 0.1);
    ctx.lineTo(x + width * 0.78, y + height * 0.55);
    ctx.stroke();
    
    // Grille
    ctx.fillStyle = '#333';
    ctx.fillRect(x + width * 0.92, y + height * 0.3, width * 0.08, height * 0.3);
    
    // Grille lines
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x + width * 0.92, y + height * 0.3 + (height * 0.3 * i / 5));
        ctx.lineTo(x + width, y + height * 0.3 + (height * 0.3 * i / 5));
        ctx.stroke();
    }
    
    // Headlights
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(x + width * 0.95, y + height * 0.25, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.95, y + height * 0.65, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Side mirror
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x + width * 0.55, y + height * 0.25, -8, 10);
    
    // Cab highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + width * 0.55, y, width * 0.45, height * 0.12);
}

// Draw Super Car
function drawSupercar(x, y, width, height) {
    // Sleek body - lower profile
    ctx.fillStyle = vehicle.color;
    ctx.beginPath();
    ctx.moveTo(x, y + height * 0.6);
    ctx.lineTo(x + width * 0.15, y + height * 0.3);
    ctx.lineTo(x + width * 0.4, y);
    ctx.lineTo(x + width * 0.7, y);
    ctx.lineTo(x + width * 0.85, y + height * 0.3);
    ctx.lineTo(x + width, y + height * 0.6);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    
    // Windshield
    ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
    ctx.beginPath();
    ctx.moveTo(x + width * 0.42, y + height * 0.15);
    ctx.lineTo(x + width * 0.68, y + height * 0.15);
    ctx.lineTo(x + width * 0.75, y + height * 0.45);
    ctx.lineTo(x + width * 0.35, y + height * 0.45);
    ctx.closePath();
    ctx.fill();
    
    // Accent stripe
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x, y + height * 0.65, width, height * 0.15);
    
    // Spoiler
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x + width * 0.05, y + height * 0.1, 8, height * 0.3);
    ctx.fillRect(x + width * 0.05, y + height * 0.1, width * 0.15, 6);
    
    // Headlights
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(x + width * 0.95, y + height * 0.7, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Air intake
    ctx.fillStyle = '#222';
    ctx.fillRect(x + width * 0.85, y + height * 0.5, width * 0.12, height * 0.15);
    
    // Body highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x + width * 0.3, y + height * 0.05, width * 0.4, height * 0.08);
}

// Draw Monster Truck
function drawMonster(x, y, width, height) {
    // Lifted body
    ctx.fillStyle = vehicle.color;
    ctx.fillRect(x + width * 0.1, y, width * 0.8, height * 0.6);
    
    // Darker bottom
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x + width * 0.1, y + height * 0.4, width * 0.8, height * 0.2);
    
    // Windshield
    ctx.fillStyle = 'rgba(100, 180, 220, 0.7)';
    ctx.fillRect(x + width * 0.2, y + height * 0.05, width * 0.3, height * 0.35);
    
    // Roll cage bars
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.15, y);
    ctx.lineTo(x + width * 0.15, y - height * 0.2);
    ctx.lineTo(x + width * 0.85, y - height * 0.2);
    ctx.lineTo(x + width * 0.85, y);
    ctx.stroke();
    
    // Suspension
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.25, y + height * 0.6);
    ctx.lineTo(x + width * 0.25, y + height * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + width * 0.75, y + height * 0.6);
    ctx.lineTo(x + width * 0.75, y + height * 0.85);
    ctx.stroke();
    
    // Exhaust pipes
    ctx.fillStyle = '#444';
    ctx.fillRect(x + width * 0.12, y + height * 0.35, 6, height * 0.25);
    ctx.fillRect(x + width * 0.82, y + height * 0.35, 6, height * 0.25);
    
    // Headlights on roof
    ctx.fillStyle = '#FFF59D';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x + width * (0.3 + i * 0.15), y - height * 0.15, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Body highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x + width * 0.1, y, width * 0.8, height * 0.1);
}

// Draw Racing Car
function drawRacer(x, y, width, height) {
    // Aerodynamic body
    ctx.fillStyle = vehicle.color;
    ctx.beginPath();
    ctx.moveTo(x + width * 0.05, y + height * 0.5);
    ctx.lineTo(x + width * 0.2, y + height * 0.15);
    ctx.lineTo(x + width * 0.5, y);
    ctx.lineTo(x + width * 0.75, y);
    ctx.lineTo(x + width * 0.9, y + height * 0.25);
    ctx.lineTo(x + width, y + height * 0.5);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
    ctx.beginPath();
    ctx.moveTo(x + width * 0.45, y + height * 0.1);
    ctx.lineTo(x + width * 0.7, y + height * 0.1);
    ctx.lineTo(x + width * 0.75, y + height * 0.4);
    ctx.lineTo(x + width * 0.4, y + height * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // Racing stripes
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x + width * 0.1, y + height * 0.55, width * 0.8, height * 0.08);
    
    // Front wing
    ctx.fillStyle = vehicle.accentColor;
    ctx.fillRect(x + width * 0.85, y + height * 0.65, width * 0.15, 5);
    ctx.fillRect(x + width * 0.92, y + height * 0.65, 3, height * 0.2);
    
    // Rear wing
    ctx.fillStyle = '#333';
    ctx.fillRect(x + width * 0.08, y + height * 0.15, 5, height * 0.3);
    ctx.fillRect(x + width * 0.05, y + height * 0.15, width * 0.1, 4);
    
    // Side air intake
    ctx.fillStyle = '#222';
    ctx.fillRect(x + width * 0.55, y + height * 0.45, width * 0.15, height * 0.12);
    
    // Number decal
    ctx.fillStyle = 'white';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('1', x + width * 0.35, y + height * 0.35);
    
    // Headlights
    ctx.fillStyle = '#FFF59D';
    ctx.beginPath();
    ctx.arc(x + width * 0.96, y + height * 0.6, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Body highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(x + width * 0.4, y + height * 0.05, width * 0.35, height * 0.06);
}

// Draw coins
function drawCoins() {
    for (let coin of coins) {
        if (coin.collected) continue;
        
        coin.rotation += 0.08;
        coin.pulse = Math.sin(Date.now() * 0.005) * 0.2 + 1;
        const x = coin.x - terrainOffset;
        
        if (x < -100 || x > canvas.width + 100) continue;
        
        ctx.save();
        ctx.translate(x, coin.y);
        ctx.rotate(coin.rotation);
        ctx.scale(coin.pulse, coin.pulse);
        
        // Glow
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, coin.radius + 8);
        glow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
        glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius + 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin body
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(-coin.radius * 0.3, -coin.radius * 0.3, 0, 0, 0, coin.radius);
        gradient.addColorStop(0, '#FFE55C');
        gradient.addColorStop(0.5, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#FF8C00';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFA500';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Symbol
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        
        ctx.restore();
    }
}

// Draw fuel cans
function drawFuelCans() {
    for (let can of fuelCans) {
        if (can.collected) continue;
        
        const x = can.x - terrainOffset;
        
        if (x < -100 || x > canvas.width + 100) continue;
        
        // Glow
        const glow = ctx.createRadialGradient(x, can.y + can.height / 2, 0, x, can.y + can.height / 2, can.width * 1.5);
        glow.addColorStop(0, 'rgba(6, 255, 165, 0.4)');
        glow.addColorStop(1, 'rgba(6, 255, 165, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, can.y + can.height / 2, can.width * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Can body
        const gradient = ctx.createLinearGradient(x - can.width / 2, 0, x + can.width / 2, 0);
        gradient.addColorStop(0, '#04D98B');
        gradient.addColorStop(0.5, '#06FFA5');
        gradient.addColorStop(1, '#04D98B');
        ctx.fillStyle = gradient;
        ctx.fillRect(x - can.width / 2, can.y, can.width, can.height);
        
        // Can top
        ctx.fillStyle = '#03B876';
        ctx.fillRect(x - can.width / 2, can.y, can.width, 8);
        
        // Can handle
        ctx.strokeStyle = '#03B876';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, can.y + 4, can.width * 0.3, Math.PI, 0, true);
        ctx.stroke();
        
        // Details/ridges
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        for (let i = 1; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x - can.width / 2, can.y + (can.height * i / 4));
            ctx.lineTo(x + can.width / 2, can.y + (can.height * i / 4));
            ctx.stroke();
        }
        
        // Symbol
        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⛽', x, can.y + can.height / 2);
        
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(x - can.width / 2 + 3, can.y + 10, 6, can.height - 20);
    }
}

// Draw particles
function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // Gravity on particles
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color || `rgba(120, 120, 120, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Check collisions
function checkCollisions() {
    // Coin collision
    for (let coin of coins) {
        if (coin.collected) continue;
        
        const dx = (coin.x - terrainOffset) - (vehicle.x + vehicle.width / 2);
        const dy = coin.y - (vehicle.y + vehicle.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < coin.radius + vehicle.width / 3) {
            coin.collected = true;
            coinsCollected++;
            totalCoins++;
            showNotification('+1 COIN');
            
            // Coin burst particles
            for (let i = 0; i < 12; i++) {
                particles.push({
                    x: coin.x - terrainOffset,
                    y: coin.y,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8 - 2,
                    life: 25,
                    maxLife: 25,
                    size: 5,
                    color: '#FFD700'
                });
            }
        }
    }
    
    // Fuel can collision
    for (let can of fuelCans) {
        if (can.collected) continue;
        
        const dx = (can.x - terrainOffset) - (vehicle.x + vehicle.width / 2);
        const dy = (can.y + can.height / 2) - (vehicle.y + vehicle.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < vehicle.width / 2 + can.width / 2) {
            can.collected = true;
            vehicle.fuel = Math.min(vehicle.fuel + 30, vehicle.maxFuel);
            showNotification('+30 FUEL');
            
            // Fuel particles
            for (let i = 0; i < 10; i++) {
                particles.push({
                    x: can.x - terrainOffset,
                    y: can.y + can.height / 2,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6 - 3,
                    life: 20,
                    maxLife: 20,
                    size: 6,
                    color: '#06FFA5'
                });
            }
        }
    }
}

// Update physics
function updatePhysics() {
    if (!gameActive || gamePaused || gameOver) return;
    
    // Acceleration
    if (gasPressed && vehicle.fuel > 0) {
        vehicle.speed += vehicle.acceleration;
        vehicle.fuel -= vehicle.fuelConsumption;
        if (vehicle.fuel < 0) vehicle.fuel = 0;
    }
    
    // Braking
    if (brakePressed && vehicle.speed > 0) {
        vehicle.speed -= vehicle.acceleration * 2;
    }
    
    // Jump (only when on ground)
    if (jumpPressed && vehicle.onGround && vehicle.fuel > 0) {
        vehicle.velocityY = -15; // Jump power
        vehicle.onGround = false;
        vehicle.fuel -= 0.5; // Small fuel cost for jumping
        jumpPressed = false; // Prevent continuous jumping
    }
    
    // Down force (push down in air)
    if (downPressed && !vehicle.onGround) {
        vehicle.velocityY += 1.2; // Extra downward force
    }
    
    // Friction
    vehicle.speed *= vehicle.grip;
    
    // Speed limits
    vehicle.speed = Math.max(0, Math.min(vehicle.maxSpeed, vehicle.speed));
    
    // Track top speed
    currentSpeed = Math.floor(vehicle.speed * 10);
    if (currentSpeed > topSpeed) topSpeed = currentSpeed;
    
    // Scroll terrain
    terrainOffset += vehicle.speed;
    distance = Math.floor(terrainOffset / 10);
    
    // Generate more terrain, coins, and fuel as we progress
    if (terrainOffset > lastTerrainX - canvas.width * 3) {
        generateMoreTerrain();
    }
    generateMoreCoins();
    generateMoreFuel();
    
    // Calculate rotation from terrain
    const frontX = vehicle.x + vehicle.width;
    const backX = vehicle.x;
    const frontY = getTerrainHeight(frontX);
    const backY = getTerrainHeight(backX);
    
    const targetRotation = Math.atan2(frontY - backY, vehicle.width);
    vehicle.rotation += (targetRotation - vehicle.rotation) * 0.15;
    
    // Gravity
    vehicle.velocityY += vehicle.gravity;
    vehicle.y += vehicle.velocityY;
    
    // Ground collision with improved stability
    const centerY = getTerrainHeight(vehicle.x + vehicle.width / 2);
    const groundFrontY = getTerrainHeight(vehicle.x + vehicle.width);
    const groundBackY = getTerrainHeight(vehicle.x);
    
    // Use the highest point of contact
    const groundY = Math.min(centerY, groundFrontY, groundBackY);
    
    if (vehicle.y + vehicle.height >= groundY - 5) {
        vehicle.y = groundY - vehicle.height - 5;
        
        // Only bounce if falling fast
        if (vehicle.velocityY > 5) {
            vehicle.velocityY = -vehicle.velocityY * 0.2;
        } else {
            vehicle.velocityY = 0;
        }
        
        vehicle.onGround = true;
    } else {
        vehicle.onGround = false;
    }
    
    // Check game over conditions
    if (vehicle.fuel <= 0 && vehicle.speed < 0.1) {
        endGame('Out of Fuel!');
    }
    
    if (Math.abs(vehicle.rotation) > Math.PI / 2.2) {
        endGame('Car Flipped!');
    }
    
    const vehicleCenterY = vehicle.y + vehicle.height / 2;
    const groundAtCenter = getTerrainHeight(vehicle.x + vehicle.width / 2);
    
    if (vehicleCenterY >= groundAtCenter - 10) {
        endGame('Crashed!');
    }
    
    if (vehicle.y > canvas.height) {
        endGame('Fell Off!');
    }
    
    updateUI();
    checkCollisions();
}

// Update UI
function updateUI() {
    document.getElementById('distance').textContent = distance;
    document.getElementById('coins').textContent = totalCoins;
    document.getElementById('speed').textContent = currentSpeed;
    document.getElementById('fuelText').textContent = Math.floor(vehicle.fuel);
    
    const fuelBar = document.getElementById('fuelBar');
    const fuelPercent = (vehicle.fuel / vehicle.maxFuel) * 100;
    fuelBar.style.width = fuelPercent + '%';
    
    if (fuelPercent < 20) {
        fuelBar.classList.add('low');
    } else {
        fuelBar.classList.remove('low');
    }
    
    // Update balance indicator
    const rotationDanger = Math.abs(vehicle.rotation) / (Math.PI / 2.2);
    const balanceText = document.getElementById('balanceText');
    
    if (rotationDanger < 0.4) {
        balanceText.textContent = 'STABLE';
        balanceText.style.color = 'var(--success)';
        balanceText.style.animation = 'none';
    } else if (rotationDanger < 0.7) {
        balanceText.textContent = 'CAREFUL';
        balanceText.style.color = 'var(--accent)';
        balanceText.style.animation = 'none';
    } else {
        balanceText.textContent = 'DANGER!';
        balanceText.style.color = 'var(--danger)';
        balanceText.style.animation = 'pulse 0.3s infinite';
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// End game
function endGame(reason = 'Game Over') {
    if (gameOver) return;
    
    gameOver = true;
    gameActive = false;
    
    const score = distance + (totalCoins * 10);
    
    document.getElementById('finalDistance').textContent = distance;
    document.getElementById('finalCoins').textContent = coinsCollected;
    document.getElementById('finalSpeed').textContent = topSpeed;
    document.getElementById('finalScore').textContent = score;
    
    const titleElement = document.querySelector('#gameOverScreen .title');
    titleElement.textContent = reason.toUpperCase();
    
    updateUpgradeButtons();
    
    setTimeout(() => {
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }, 500);
}

// Update upgrade buttons
function updateUpgradeButtons() {
    document.getElementById('engineLevel').textContent = upgrades.engine;
    document.getElementById('fuelLevel').textContent = upgrades.fuel;
    document.getElementById('gripLevel').textContent = upgrades.grip;
    
    const engineBtn = document.getElementById('upgradeEngine');
    const fuelBtn = document.getElementById('upgradeFuel');
    const gripBtn = document.getElementById('upgradeGrip');
    
    engineBtn.disabled = upgrades.engine >= 5 || totalCoins < 50;
    fuelBtn.disabled = upgrades.fuel >= 5 || totalCoins < 40;
    gripBtn.disabled = upgrades.grip >= 5 || totalCoins < 30;
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawSky();
    drawClouds();
    drawTerrain();
    drawFuelCans();
    drawCoins();
    drawParticles();
    drawVehicle();
    updatePhysics();
    
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    gameActive = true;
    gameOver = false;
    gamePaused = false;
    terrainOffset = 0;
    distance = 0;
    coinsCollected = 0;
    topSpeed = 0;
    currentSpeed = 0;
    particles = [];
    lastCoinCheck = 0;
    lastFuelCheck = 0;
    
    initVehicle();
    generateTerrain();
    generateCoins();
    generateFuelCans();
    updateUI();
}

// Pause game
document.getElementById('pauseBtn').addEventListener('click', () => {
    if (!gameActive || gameOver) return;
    gamePaused = true;
    document.getElementById('pauseScreen').classList.remove('hidden');
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    gamePaused = false;
    document.getElementById('pauseScreen').classList.add('hidden');
});

// Vehicle selection
document.querySelectorAll('.vehicle-card').forEach(card => {
    card.addEventListener('click', () => {
        const vehicleType = card.dataset.vehicle;
        const vehicleData = vehicleTypes[vehicleType];
        
        // Check if vehicle is owned
        if (ownedVehicles.includes(vehicleType)) {
            // Select this vehicle
            document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedVehicleType = vehicleType;
        } else {
            // Try to purchase
            if (totalCoins >= vehicleData.price) {
                // Purchase vehicle
                totalCoins -= vehicleData.price;
                ownedVehicles.push(vehicleType);
                
                // Update UI
                card.classList.remove('locked');
                card.querySelector('.vehicle-lock').style.display = 'none';
                card.querySelector('.vehicle-price').textContent = 'OWNED';
                card.querySelector('.vehicle-price').style.color = 'var(--success)';
                
                // Select it
                document.querySelectorAll('.vehicle-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedVehicleType = vehicleType;
                
                updateMenuCoins();
                showNotification(`${vehicleData.name.toUpperCase()} PURCHASED!`);
            } else {
                showNotification(`Need ${vehicleData.price - totalCoins} more coins!`);
            }
        }
    });
});

// Update menu coins display
function updateMenuCoins() {
    document.getElementById('menuCoins').textContent = totalCoins;
}

// Update vehicle cards locked state
function updateVehicleCards() {
    document.querySelectorAll('.vehicle-card').forEach(card => {
        const vehicleType = card.dataset.vehicle;
        const priceElement = card.querySelector('.vehicle-price');
        
        if (ownedVehicles.includes(vehicleType)) {
            card.classList.remove('locked');
            if (card.querySelector('.vehicle-lock')) {
                card.querySelector('.vehicle-lock').style.display = 'none';
            }
            if (priceElement) {
                priceElement.textContent = 'OWNED';
                priceElement.style.color = 'var(--success)';
            }
        } else {
            card.classList.add('locked');
            if (card.querySelector('.vehicle-lock')) {
                card.querySelector('.vehicle-lock').style.display = 'block';
            }
        }
    });
    
    updateMenuCoins();
}

// Controls
const controlHandlers = {
    gas: {
        start: () => gasPressed = true,
        end: () => gasPressed = false
    },
    brake: {
        start: () => brakePressed = true,
        end: () => brakePressed = false
    },
    jump: {
        start: () => jumpPressed = true,
        end: () => jumpPressed = false
    },
    down: {
        start: () => downPressed = true,
        end: () => downPressed = false
    }
};

['gas', 'brake', 'jump', 'down'].forEach(type => {
    const btn = document.getElementById(type + 'Btn');
    btn.addEventListener('mousedown', controlHandlers[type].start);
    btn.addEventListener('mouseup', controlHandlers[type].end);
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        controlHandlers[type].start();
    });
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        controlHandlers[type].end();
    });
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') gasPressed = true;
    if (e.key === 'ArrowDown') brakePressed = true;
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scroll
        jumpPressed = true;
    }
    if (e.key === 's' || e.key === 'S') downPressed = true;
    if (e.key === 'Escape' && gameActive && !gameOver) {
        gamePaused = !gamePaused;
        document.getElementById('pauseScreen').classList.toggle('hidden', !gamePaused);
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') gasPressed = false;
    if (e.key === 'ArrowDown') brakePressed = false;
    if (e.key === ' ' || e.key === 'Spacebar') jumpPressed = false;
    if (e.key === 's' || e.key === 'S') downPressed = false;
});

// Upgrade handlers
document.getElementById('upgradeEngine').addEventListener('click', () => {
    if (upgrades.engine < 5 && totalCoins >= 50) {
        totalCoins -= 50;
        upgrades.engine++;
        updateUpgradeButtons();
        showNotification('ENGINE UPGRADED!');
    }
});

document.getElementById('upgradeFuel').addEventListener('click', () => {
    if (upgrades.fuel < 5 && totalCoins >= 40) {
        totalCoins -= 40;
        upgrades.fuel++;
        updateUpgradeButtons();
        showNotification('FUEL TANK UPGRADED!');
    }
});

document.getElementById('upgradeGrip').addEventListener('click', () => {
    if (upgrades.grip < 5 && totalCoins >= 30) {
        totalCoins -= 30;
        upgrades.grip++;
        updateUpgradeButtons();
        showNotification('TIRE GRIP UPGRADED!');
    }
});

// Button handlers
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    startGame();
});

document.getElementById('mainMenuBtn').addEventListener('click', () => {
    document.getElementById('pauseScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    gameActive = false;
    gamePaused = false;
    updateVehicleCards();
});

document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
    updateVehicleCards();
});

// Window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Initialize
generateTerrain();
generateCoins();
generateFuelCans();
updateVehicleCards();
gameLoop();
