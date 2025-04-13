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
    displacement: 0,
    isMilestone: false,
    milestoneValue: 0,
    consumable: null
  };
  
  platforms.push(firstPlatform);
  
  // Create initial platforms with proper spacing
  const firstPlatformY = canvas.height - 200; // Start position for first platform
  let lastY = firstPlatformY;
  
  for (let i = 0; i < 10; i++) {
    // Create platform at appropriate height from previous platform
    const newPlatform = createPlatformAtHeight(i, lastY);
    lastY = newPlatform.y; // Update lastY for next platform
    platforms.push(newPlatform);
  }
}

// Create a platform at an appropriate height from previous platform
function createPlatformAtHeight(id, lastY) {
  // Calculate platform score
  const platformScore = (id + 1) * 10;
  
  // Determine if this is a milestone platform (divisible by 100)
  const isMilestone = platformScore % 100 === 0;
  // Set milestone value to the actual score if it's a milestone
  const milestoneValue = isMilestone ? platformScore : 0;
  
  // Calculate min and max allowed Y positions
  const ironManHeight = CHARACTER_SETTINGS['ironman'].height;
  const spiderManHeight = CHARACTER_SETTINGS['spiderman'].height;
  const maxCharHeight = Math.max(ironManHeight, spiderManHeight);
  
  // Minimum height difference: character can jump to it (jump height)
  const jumpHeight = Math.abs(GAME_CONSTANTS.BASE_JUMP) * 2; // Approximate jump height
  // Maximum height difference: not too far to jump
  const maxHeightDiff = jumpHeight * 0.9; // 90% of jump height
  // Minimum height difference: not too close (at least character height)
  const minHeightDiff = maxCharHeight + 30;
  
  // Calculate a valid Y position range
  const minY = lastY - maxHeightDiff; // Can't be too high (limited by jump height)
  const maxY = lastY - minHeightDiff; // Can't be too close to previous platform
  
  // Calculate random position within valid range
  let newY;
  if (minY < maxY) {
    // Normal case: random position within range
    newY = minY + Math.random() * (maxY - minY);
  } else {
    // Edge case: use minimum valid height if range is invalid
    newY = minY;
  }
  
  // Safety bound checks
  if (id === 0) {
    // First platform should be reachable from ground
    newY = Math.min(newY, canvas.height - jumpHeight);
  }
  
  // Make sure Y is not negative (above screen)
  newY = Math.max(newY, 50);
  
  // Decide platform characteristics
  const willHaveEnemy = Math.random() < getEnemyProbability();
  const width = willHaveEnemy ? 
                GAME_CONSTANTS.PLATFORM_WITH_ENEMY_WIDTH : 
                GAME_CONSTANTS.STANDARD_PLATFORM_WIDTH;
  
  // Decide if moving platform (6% chance - 3% up, 3% down)
  const movingRandom = Math.random() * 100;
  const isMoving = movingRandom < 6;
  const moveDirection = movingRandom < 3 ? 'up' : 'down';
  
  // Calculate safe X position to prevent platform from going off screen
  const maxX = canvas.width - width;
  const x = Math.random() * maxX;
  
  // Create platform object
  let platform = {
    id: id,
    x: x,
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
    isMilestone: isMilestone,
    milestoneValue: milestoneValue,
    enemy: null,
    consumable: null, // Initialize consumable property
    // Moving platform properties
    isMoving: isMoving,
    moveDirection: isMoving ? moveDirection : null,
    originalY: newY,
    displacement: 0
  };
  
  // Add enemy if needed
  if (willHaveEnemy) {
    platform.enemy = createEnemy(platform);
  } else {
    // Consider adding a consumable if there's no enemy
    addConsumableToPlatform(platform);
  }
  
  return platform;
}

// Recycle an existing platform
function recyclePlatform(platform) {
  // Remove old enemy
  if (platform.enemy && platform.enemy.element) {
    platform.enemy.element.remove();
  }
  
  // Remove old consumable
  if (platform.consumable && platform.consumable.element) {
    platform.consumable.element.remove();
  }
  
  // Find highest platform ID
  const maxId = Math.max(...platforms.map(p => p.id));
  const newId = maxId + 1;
  
  // Calculate new platform score
  const newScore = (newId + 1) * 10;
  
  // Determine if this will be a milestone platform
  const isMilestone = newScore % 100 === 0;
  const milestoneValue = isMilestone ? newScore : 0;
  
  // Find the highest platform (lowest Y value)
  let highestPlatform = platforms[0];
  platforms.forEach(p => {
    if (p.y < highestPlatform.y) {
      highestPlatform = p;
    }
  });
  
  // Get height of characters
  const maxCharHeight = Math.max(
    CHARACTER_SETTINGS['ironman'].height,
    CHARACTER_SETTINGS['spiderman'].height
  );
  
  // Calculate minimum and maximum height difference
  const jumpHeight = Math.abs(GAME_CONSTANTS.BASE_JUMP) * 2;
  const maxHeightDiff = jumpHeight * 0.9;
  const minHeightDiff = maxCharHeight + 30;
  
  // Calculate new Y position
  const newY = highestPlatform.y - minHeightDiff - (Math.random() * (maxHeightDiff - minHeightDiff));
  const absoluteY = highestPlatform.absoluteY - minHeightDiff - (Math.random() * (maxHeightDiff - minHeightDiff));
  
  // Decide if recycled platform will have an enemy
  const willHaveEnemy = Math.random() < getEnemyProbability();
  
  // Decide if this recycled platform will move (6% chance - 3% up, 3% down)
  const movingRandom = Math.random() * 100;
  const isMoving = movingRandom < 6;
  const moveDirection = movingRandom < 3 ? 'up' : 'down';
  
  // Update platform properties
  platform.id = newId;
  platform.y = newY;
  platform.width = willHaveEnemy ? GAME_CONSTANTS.PLATFORM_WITH_ENEMY_WIDTH : GAME_CONSTANTS.STANDARD_PLATFORM_WIDTH;
  platform.x = Math.random() * (canvas.width - platform.width);
  platform.absoluteY = absoluteY;
  platform.scored = false;
  platform.standingTime = 0;
  platform.isFalling = false;
  platform.fallSpeed = 0;
  platform.color = '#593A0A';
  platform.scoreValue = newScore;
  platform.isMilestone = isMilestone;
  platform.milestoneValue = milestoneValue;
  platform.isMoving = isMoving;
  platform.moveDirection = isMoving ? moveDirection : null;
  platform.originalY = newY;
  platform.displacement = 0;
  platform.consumable = null;
  
  // Add enemy if needed
  if (willHaveEnemy) {
    platform.enemy = createEnemy(platform);
  } else {
    platform.enemy = null;
    // Consider adding a consumable if there's no enemy
    addConsumableToPlatform(platform);
  }
  
  return platform;
}

// Draw score box for milestone platforms
function drawScoreBox(x, y, scoreValue) {
  // Make sure we have a valid score value to display
  if (!scoreValue || scoreValue <= 0) {
    return; // Skip drawing if no valid value
  }
  
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
      
      // Update consumable position if present
      if (platform.consumable) {
        platform.consumable.y = platform.y - platform.consumable.height - 5;
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
      
      if (platform.consumable) {
        platform.consumable.y += platform.fallSpeed;
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
    
    // Add highlight for platforms with consumables
    if (platform.consumable) {
      ctx.strokeStyle = '#00bfff';
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
    if (platform.isMilestone && platform.milestoneValue > 0) {
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
} // This closing brace was missing for updatePlatforms function

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