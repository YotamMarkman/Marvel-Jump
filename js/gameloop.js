// Game loop variables
let gameOver = false;
let canvas, ctx, gameContainer;

// Initialize game elements
function initGameElements() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  gameContainer = document.getElementById('gameContainer');
}

// Main game loop
function gameLoop() {
  if (!gameOver) {
    // Handle player input
    handlePlayerMovement();
    
    // Update player
    updatePlayer();
    
    // Update platforms and check collisions
    absoluteHeight += player.velY < 0 ? -player.velY : 0;
    handleScrolling();
    updatePlatforms();
    updateEnemies();
    updateConsumables(); // Add this line to update consumables
    checkPlatformCollisions();
    
    // Draw score
    drawScore();
    
    // Draw collision boxes for debugging (uncomment to enable)
    // window.debugMode = true; // Enable for debugging
    // drawCollisionBoxes();
  }
  
  // Continue game loop
  requestAnimationFrame(gameLoop);
}

// Preload background image
function loadBackground() {
  const backgroundImg = new Image();
  backgroundImg.src = "Titan_background.png";
  
  backgroundImg.onload = function() {
    console.log("Background loaded.");
    initScore();
  };
  
  backgroundImg.onerror = function() {
    console.error("Background image failed to load");
    gameContainer.style.background = "linear-gradient(to bottom, #87CEEB, #1C2951)";
    initScore();
  };
}

// Start the game
function startGame() {
  initScore();
  requestAnimationFrame(gameLoop);
}