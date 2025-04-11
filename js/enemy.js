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
  
  // Update enemy positions
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
        
        // Check for collisions with player
        if (isColliding(player, platform.enemy)) {
          showGameOverOverlay();
          gameOver = true;
        }
      }
    });
  }
  
  // Get enemy probability based on score
  function getEnemyProbability() {
    return Math.min(0.05 + Math.floor(score / 200) * 0.01, 0.20);
  }