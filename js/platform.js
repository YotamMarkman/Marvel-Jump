// Platform variables
let platforms = [];
let currentPlatform = null;
let firstPlatformRemoved = false;

// Initialize platforms
function initPlatforms() {
  platforms = [];
  
  // Create special starting platform
  let firstPlatform = {
    id: -1,
    x: 0,
    y: canvas.height - 10,
    width: canvas.width,
    height: 10,
    absoluteY: canvas.height - 10,
    scored: true,
    standingTime: 0,
    fallCountdown: Infinity,
    isFalling: false,
    fallSpeed: 0,
    color: '#2E8B57',
    enemy: null,
    isFirstPlatform: true,
    // Moving platform properties
    isMoving: false,
    moveDirection: null,
    originalY: canvas.height - 10,
    displacement: 0
  };
  
  platforms.push(firstPlatform);
  
  // Create initial platforms
  for (let i = 0; i < 10; i++) {
    createPlatform(i);
  }
}

// Create a new platform
function createPlatform(id, isRecycled = false) {
  const platformScore = (id + 1) * 10;
  const milestoneValue = Math.floor(id / 10) * 100 + 100;
  
  let newY;
  let attempts = 0;
  const maxAttempts = 100;
  
  // Find a valid position
  do {
    const basePosition = isRecycled ? 
                      -150 - (Math.random() * 100) : 
                      canvas.height - (180 * id) - 50;
    newY = basePosition + (Math.random() * 40 - 20);
    attempts++;
    if (attempts >= maxAttempts) {
      newY = basePosition;
      break;
    }
  } while (!isValidPlatformPosition(newY));
  
  // Decide platform characteristics
  const willHaveEnemy = Math.random() < getEnemyProbability();
  const width = willHaveEnemy ? 
                GAME_CONSTANTS.PLATFORM_WITH_ENEMY_WIDTH : 
                GAME_CONSTANTS.STANDARD_PLATFORM_WIDTH;
  
  // Decide if moving platform (6% chance - 3% up, 3% down)
  const movingRandom = Math.random() * 100;
  const isMoving = movingRandom < 6;
  const moveDirection = movingRandom < 3 ? 'up' : 'down';
  
  // Create platform object
  let platform = {
    id: id,
    x: Math.random() * (canvas.width - width),
    y: newY,
    width: width,
    height: 10,
    absoluteY: newY,
    scored: false,
    standingTime: 0,
    fallCountdown: getFallCountdown(),
    isFalling: false,
    fallSpeed: 0,
    color: '#593A0A',
    scoreValue: platformScore,
    isMilestone: (id + 1) % 10 === 0,
    milestoneValue: milestoneValue,
    enemy: null,
    // Moving platform properties
    isMoving: isMoving,
    moveDirection: isMoving ? moveDirection : null,
    originalY: newY,
    displacement: 0
  };
  
  // Add enemy if needed
  if (willHaveEnemy) {
    platform.enemy = createEnemy(platform);
  }
  
  // Handle recycled platform's absolute Y position
  if (isRecycled) {
    platform.absoluteY = platform.absoluteY - canvas.height - platform.height;
  } else {
    platforms.push(platform);
  }
  
  return platform;
}

// Recycle an existing platform
function recyclePlatform(platform) {
  // Remove old enemy
  if (platform.enemy && platform.enemy.element) {
    platform.enemy.element.remove();
  }
  
  // Find highest platform ID
  const maxId = Math.max(...platforms.map(p => p.id));
  
  // Create new platform properties
  const recycledPlatform = createPlatform(maxId + 1, true);
  
  // Copy new properties to existing platform object
  for (const prop in recycledPlatform) {
    platform[prop] = recycledPlatform[prop];
  }
  
  return platform;
}

// Check if a platform position is valid
function isValidPlatformPosition(newY) {
  // Get maximum character height for proper spacing
  const maxCharHeight = Math.max(
    CHARACTER_SETTINGS['ironman'].height,
    CHARACTER_SETTINGS['spiderman'].height
  );
  
  // Required vertical space between platforms
  const minVerticalSpacing = maxCharHeight + 30;
  
  return platforms.every(platform => 
    Math.abs(platform.y - newY) >= minVerticalSpacing
  );
}

// Get platform color based on state
function getPlatformColor(platform) {
  if (platform.isFalling) return '#8B4513';
  if (platform === currentPlatform) {
    let timeRatio = platform.standingTime / (platform.fallCountdown * 60);
    if (timeRatio < 0.33) return '#593A0A';
    else if (timeRatio < 0.66) return '#704214';
    else return '#8B4513';
  }
  
  // Special color for moving platforms
  if (platform.isMoving) {
    return platform.moveDirection === 'up' ? '#4286f4' : '#f47142';
  }
  
  return platform.isFirstPlatform ? '#2E8B57' : '#593A0A';
}

// Update platforms
function updatePlatforms() {
  // Handle removing first platform after score threshold
  if (score >= 50 && !firstPlatformRemoved) {
    platforms = platforms.filter(p => !p.isFirstPlatform);
    firstPlatformRemoved = true;
  }
  
  // Update moving platforms
  platforms.forEach(platform => {
    if (platform.isMoving && !platform.isFalling) {
      // Calculate movement based on direction
      const speed = platform.moveDirection === 'up' ? 
                    -GAME_CONSTANTS.MOVING_PLATFORM_SPEED : 
                    GAME_CONSTANTS.MOVING_PLATFORM_SPEED;
      
      // Update displacement
      platform.displacement += speed;
      
      // Check if reached max displacement
      if (Math.abs(platform.displacement) >= GAME_CONSTANTS.MOVING_PLATFORM_RANGE) {
        // Reverse direction
        platform.moveDirection = platform.moveDirection === 'up' ? 'down' : 'up';
      }
      
      // Update platform position
      platform.y = platform.originalY + platform.displacement;
      
      // If player is on this platform, move them with it
      if (platform === currentPlatform && !player.jumping) {
        player.y += speed;
      }
      
      // Update enemy position if present
      if (platform.enemy) {
        platform.enemy.y = platform.y - GAME_CONSTANTS.ENEMY_HEIGHT;
      }
    }
    
    // Update falling platforms
    if (platform.isFalling) {
      platform.fallSpeed += 0.1;
      platform.y += platform.fallSpeed;
      platform.isMoving = false; // Stop movement when falling
      
      if (platform.enemy) {
        platform.enemy.y += platform.fallSpeed;
      }
    }
  });
  
  // Draw platforms
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  platforms.forEach(platform => {
    // Set platform color
    platform.color = getPlatformColor(platform);
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    
    // Add highlight for platforms with enemies
    if (platform.enemy) {
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 2;
      ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    // Add arrow indicators for moving platforms
    if (platform.isMoving && !platform.isFalling) {
      ctx.fillStyle = "white";
      ctx.beginPath();
      
      if (platform.moveDirection === 'up') {
        // Draw up arrow
        const arrowX = platform.x + platform.width / 2;
        const arrowY = platform.y + platform.height + 5;
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 5, arrowY + 5);
        ctx.lineTo(arrowX + 5, arrowY + 5);
      } else {
        // Draw down arrow
        const arrowX = platform.x + platform.width / 2;
        const arrowY = platform.y - 5;
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 5, arrowY - 5);
        ctx.lineTo(arrowX + 5, arrowY - 5);
      }
      
      ctx.fill();
    }
    
    // Draw milestone score box
    if (platform.isMilestone) {
      drawScoreBox(platform.x + platform.width / 2 - 15, platform.y - 15, platform.milestoneValue);
    }
    
    // Draw countdown bar
    if (platform === currentPlatform && !platform.isFalling) {
      let timeRatio = platform.standingTime / (platform.fallCountdown * 60);
      let countdownWidth = platform.width * (1 - timeRatio);
      ctx.fillStyle = 'green';
      ctx.fillRect(platform.x, platform.y - 5, countdownWidth, 3);
    }
  });
}

// Draw score box for milestone platforms
function drawScoreBox(x, y, scoreValue) {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(x, y, 30, 20);
  ctx.strokeStyle = '#593A0A';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 30, 20);
  ctx.beginPath();
  ctx.moveTo(x, y + 7);
  ctx.lineTo(x + 30, y + 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y + 14);
  ctx.lineTo(x + 30, y + 14);
  ctx.stroke();
  ctx.fillStyle = 'white';
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(scoreValue, x + 15, y + 14);
  ctx.textAlign = "start";
}

// Check platform collisions with player
function checkPlatformCollisions() {
  let onPlatform = false;
  
  platforms.forEach(platform => {
    if (
      !platform.isFalling &&
      player.x < platform.x + platform.width &&
      player.x + player.width > platform.x &&
      player.y + player.height >= platform.y &&
      player.y + player.height <= platform.y + platform.height + Math.abs(player.velY) &&
      player.velY >= 0
    ) {
      player.jumping = false;
      player.velY = 0;
      player.y = platform.y - player.height;
      onPlatform = true;
      
      if (currentPlatform !== platform) {
        if (currentPlatform) currentPlatform.standingTime = 0;
        currentPlatform = platform;
        currentPlatform.standingTime = 0;
      }
      
      if (!platform.isFirstPlatform && !platform.scored) {
        updateScore(platform.id);
        platform.scored = true;
      }
      
      if (Math.abs(player.velX) < 0.5 && !player.jumping) {
        platform.standingTime++;
        if (platform.standingTime >= platform.fallCountdown * 60) {
          platform.isFalling = true;
          platform.fallSpeed = 0.5;
          currentPlatform = null;
        }
      } else {
        platform.standingTime = 0;
      }
    }
  });
  
  if (!onPlatform && player.velY > 0) {
    currentPlatform = null;
    player.jumping = true;
  }
  
  if (player.jumping || Math.abs(player.velX) > 0.1) {
    if (currentPlatform) {
      if (player.x + player.width < currentPlatform.x || 
          player.x > currentPlatform.x + currentPlatform.width) {
        currentPlatform.standingTime = 0;
        currentPlatform = null;
      } else if (player.jumping) {
        currentPlatform.standingTime = 0;
        currentPlatform = null;
      }
    }
  }
}