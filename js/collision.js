// Collision detection variables
const IRONMAN_COLLISION_OFFSET = {
  x: 20,  // Horizontal offset from edges
  y: 40,  // Vertical offset from top
  width: 80, // Effective collision width
  height: 100 // Effective collision height
};

const SPIDERMAN_COLLISION_OFFSET = {
  x: 10,  // Horizontal offset from edges
  y: 20,  // Vertical offset from top
  width: 40, // Effective collision width
  height: 50 // Effective collision height
};

// Get collision box for the current player character
function getPlayerCollisionBox() {
  const box = {
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height
  };
  
  // Apply character-specific collision adjustments
  if (selectedCharacter === 'ironman') {
    box.x += IRONMAN_COLLISION_OFFSET.x;
    box.y += IRONMAN_COLLISION_OFFSET.y;
    box.width = IRONMAN_COLLISION_OFFSET.width;
    box.height = IRONMAN_COLLISION_OFFSET.height;
  } else if (selectedCharacter === 'spiderman') {
    box.x += SPIDERMAN_COLLISION_OFFSET.x;
    box.y += SPIDERMAN_COLLISION_OFFSET.y;
    box.width = SPIDERMAN_COLLISION_OFFSET.width;
    box.height = SPIDERMAN_COLLISION_OFFSET.height;
  }
  
  return box;
}

// Character-specific collision detection for Iron Man
function ironManCollision(enemy) {
  if (!enemy || enemy.width === undefined || enemy.height === undefined) {
    return false;
  }
  
  // Use a tighter collision box for Iron Man
  const ironManBox = {
    x: player.x + IRONMAN_COLLISION_OFFSET.x,
    y: player.y + IRONMAN_COLLISION_OFFSET.y,
    width: IRONMAN_COLLISION_OFFSET.width,
    height: IRONMAN_COLLISION_OFFSET.height
  };
  
  // Calculate center points
  const playerCenterX = ironManBox.x + (ironManBox.width / 2);
  const playerCenterY = ironManBox.y + (ironManBox.height / 2);
  const enemyCenterX = enemy.x + (enemy.width / 2);
  const enemyCenterY = enemy.y + (enemy.height / 2);
  
  // Define smaller collision radius for Iron Man's size
  const collisionWidth = 25;  // Reduced collision area
  const collisionHeight = 35; // Reduced collision area
  
  // Check if centers are within the collision box
  return Math.abs(playerCenterX - enemyCenterX) < collisionWidth &&
         Math.abs(playerCenterY - enemyCenterY) < collisionHeight;
}

// Character-specific collision detection for Spider-Man
function spiderManCollision(enemy) {
  if (!enemy || enemy.width === undefined || enemy.height === undefined) {
    return false;
  }
  
  // Use appropriate collision box for Spider-Man
  const spiderManBox = {
    x: player.x + SPIDERMAN_COLLISION_OFFSET.x,
    y: player.y + SPIDERMAN_COLLISION_OFFSET.y,
    width: SPIDERMAN_COLLISION_OFFSET.width,
    height: SPIDERMAN_COLLISION_OFFSET.height
  };
  
  // Calculate center points
  const playerCenterX = spiderManBox.x + (spiderManBox.width / 2);
  const playerCenterY = spiderManBox.y + (spiderManBox.height / 2);
  const enemyCenterX = enemy.x + (enemy.width / 2);
  const enemyCenterY = enemy.y + (enemy.height / 2);
  
  // Define appropriate collision radius for Spider-Man's smaller size
  const collisionWidth = 20;
  const collisionHeight = 30;
  
  // Check if centers are within the collision box
  return Math.abs(playerCenterX - enemyCenterX) < collisionWidth &&
         Math.abs(playerCenterY - enemyCenterY) < collisionHeight;
}

// Unified collision detection that uses character-specific methods
function isColliding(player, enemy) {
  if (!enemy || enemy.width === undefined || enemy.height === undefined) {
    return false;
  }
  
  // Use character-specific collision detection
  if (selectedCharacter === 'ironman') {
    return ironManCollision(enemy);
  } else if (selectedCharacter === 'spiderman') {
    return spiderManCollision(enemy);
  }
  
  // Fallback to generic center-based collision if character isn't recognized
  // Calculate center points
  const playerCenterX = player.x + (player.width / 2);
  const playerCenterY = player.y + (player.height / 2);
  const enemyCenterX = enemy.x + (enemy.width / 2);
  const enemyCenterY = enemy.y + (enemy.height / 2);
  
  // Define collision box size
  const collisionWidth = 30;
  const collisionHeight = 40;
  
  // Check if centers are within the collision box
  return Math.abs(playerCenterX - enemyCenterX) < collisionWidth &&
         Math.abs(playerCenterY - enemyCenterY) < collisionHeight;
}

// Handle screen scrolling based on player position
function handleScrolling() {
  let scrollAmount = 0;
  
  if (player.y < canvas.height / 4) {
    scrollAmount = canvas.height / 4 - player.y;
    player.y += scrollAmount;
    
    platforms.forEach(platform => {
      platform.y += scrollAmount;
      
      if (platform.isMoving) {
        platform.originalY += scrollAmount;
      }
      
      if (platform.enemy) {
        platform.enemy.y += scrollAmount;
      }
      
      if (platform.y > canvas.height) {
        recyclePlatform(platform);
      }
    });
    
    // Track absolute height for score calculations
    absoluteHeight += scrollAmount;
  }
  
  return scrollAmount;
}

// Draw collision boxes for debugging (can be enabled for testing)
function drawCollisionBoxes() {
  // Only run in debug mode
  if (!window.debugMode) return;
  
  // Draw player collision box
  const playerBox = getPlayerCollisionBox();
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 1;
  ctx.strokeRect(playerBox.x, playerBox.y, playerBox.width, playerBox.height);
  
  // Draw enemy collision boxes
  platforms.forEach(platform => {
    if (platform.enemy) {
      const enemy = platform.enemy;
      
      // Draw enemy collision box
      ctx.strokeStyle = 'yellow';
      ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Draw collision centers
      const playerCenterX = playerBox.x + (playerBox.width / 2);
      const playerCenterY = playerBox.y + (playerBox.height / 2);
      const enemyCenterX = enemy.x + (enemy.width / 2);
      const enemyCenterY = enemy.y + (enemy.height / 2);
      
      // Player center
      ctx.fillStyle = 'green';
      ctx.beginPath();
      ctx.arc(playerCenterX, playerCenterY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Enemy center
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(enemyCenterX, enemyCenterY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Line between centers
      ctx.strokeStyle = 'white';
      ctx.beginPath();
      ctx.moveTo(playerCenterX, playerCenterY);
      ctx.lineTo(enemyCenterX, enemyCenterY);
      ctx.stroke();
    }
  });
}