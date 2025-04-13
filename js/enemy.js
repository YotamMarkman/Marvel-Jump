// Create an enemy for a platform
function createEnemy(platform) {
  let enemyType = Math.random() < 0.5 ? 'Type1' : 'Type2';
  
  // For static enemy (Type1), use Thanos; for moving enemy (Type2), use Mysterio for Iron Man and Venom for Spider-Man.
  if (enemyType === 'Type1') {
    // Create a DOM element for Thanos (static)
    const thanosEl = document.createElement('div');
    thanosEl.classList.add('thanos');
    gameContainer.appendChild(thanosEl);
    
    return {
      type: enemyType,
      x: platform.x + (platform.width / 2) - (GAME_CONSTANTS.ENEMY_WIDTH / 2),
      y: platform.y - GAME_CONSTANTS.ENEMY_HEIGHT,
      width: GAME_CONSTANTS.ENEMY_WIDTH,
      height: GAME_CONSTANTS.ENEMY_HEIGHT,
      direction: 1,
      speed: 0,
      element: thanosEl
    };
  } else {
    const movingEnemyEl = document.createElement('div');
    // If Iron Man, use Mysterio; if Spider-Man, use Venom
    const enemyClass = selectedCharacter === 'spiderman' ? 'venom' : 'mysterio';
    movingEnemyEl.classList.add(enemyClass);
    gameContainer.appendChild(movingEnemyEl);
    
    return {
      type: enemyType,
      x: platform.x + (platform.width / 2) - (GAME_CONSTANTS.ENEMY_WIDTH / 2),
      y: platform.y - GAME_CONSTANTS.ENEMY_HEIGHT,
      width: GAME_CONSTANTS.ENEMY_WIDTH,
      height: GAME_CONSTANTS.ENEMY_HEIGHT,
      direction: 1,
      speed: 1,
      element: movingEnemyEl
    };
  }
}

// Update enemy positions and check for collisions
function updateEnemies() {
  platforms.forEach(platform => {
    if (platform.enemy) {
      platform.enemy.y = platform.y - GAME_CONSTANTS.ENEMY_HEIGHT;
      
      if (platform.enemy.type === 'Type2') {
        platform.enemy.x += platform.enemy.speed * platform.enemy.direction;
        
        if (platform.enemy.x <= platform.x || 
            (platform.enemy.x + platform.enemy.width) >= (platform.x + platform.width)) {
          platform.enemy.direction *= -1;
          platform.enemy.x = Math.max(
            platform.x, 
            Math.min(platform.enemy.x, platform.x + platform.width - platform.enemy.width)
          );
        }
      } else {
        platform.enemy.x = platform.x + (platform.width / 2) - (GAME_CONSTANTS.ENEMY_WIDTH / 2);
      }
      
      if (platform.enemy.element) {
        platform.enemy.element.style.left = platform.enemy.x + 'px';
        platform.enemy.element.style.top = platform.enemy.y + 'px';
      }
      
      // Check for collisions with player using character-specific collision detection
      if (isColliding(player, platform.enemy)) {
        // Check if player is invincible before ending game
        if (isPlayerInvincible()) {
          // Player is invincible - destroy the enemy instead
          destroyEnemy(platform.enemy);
          platform.enemy = null;
          
          // Add score bonus for defeating enemy
          score += 25;
          document.getElementById('scoreDisplay').textContent = "Score: " + score;
          flashScoreDisplay();
          
          // Create destruction effect
          createDestructionEffect(platform.x + platform.width/2, platform.y - GAME_CONSTANTS.ENEMY_HEIGHT/2);
        } else {
          // Player is not invincible - game over
          showGameOverOverlay();
          gameOver = true;
        }
      }
    }
  });
}

// Create destruction effect when enemy is defeated
function createDestructionEffect(x, y) {
  // Create explosion container
  const explosion = document.createElement('div');
  explosion.className = 'explosion';
  explosion.style.position = 'absolute';
  explosion.style.left = (x - 40) + 'px';
  explosion.style.top = (y - 40) + 'px';
  explosion.style.width = '80px';
  explosion.style.height = '80px';
  explosion.style.zIndex = '10';
  
  // Create particles
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'explosion-particle';
    particle.style.position = 'absolute';
    particle.style.width = (3 + Math.random() * 5) + 'px';
    particle.style.height = (3 + Math.random() * 5) + 'px';
    particle.style.backgroundColor = getRandomColor();
    particle.style.borderRadius = '50%';
    particle.style.left = '40px';
    particle.style.top = '40px';
    
    // Set random direction and speed
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 5;
    const dirX = Math.cos(angle) * speed;
    const dirY = Math.sin(angle) * speed;
    
    // Animate particle
    particle.style.transition = 'all 0.5s ease-out';
    setTimeout(() => {
      particle.style.transform = `translate(${dirX * 20}px, ${dirY * 20}px)`;
      particle.style.opacity = '0';
    }, 10);
    
    explosion.appendChild(particle);
  }
  
  gameContainer.appendChild(explosion);
  
  // Remove explosion after animation completes
  setTimeout(() => {
    explosion.remove();
  }, 600);
}

// Get random color for explosion particles
function getRandomColor() {
  const colors = ['#ff0000', '#ff7700', '#ffcc00', '#00bfff', '#ffffff'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Destroy an enemy
function destroyEnemy(enemy) {
  if (enemy && enemy.element) {
    enemy.element.remove();
  }
}

// Get enemy probability based on score
function getEnemyProbability() {
  return Math.min(0.05 + Math.floor(score / 200) * 0.01, 0.20);
}