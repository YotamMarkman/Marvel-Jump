// Consumables system for power-ups in the game

// Consumable types
const CONSUMABLE_TYPES = {
  SPACE_STONE: {
    name: 'spaceStone',
    className: 'space-stone',
    width: 30,
    height: 30,
    effectDuration: 7000, // milliseconds
    spawnProbability: 0.01 // 1% chance per platform without an enemy
  }
  // Add other stones here later
};

// Active effects tracker
let activeEffects = {
  invincible: false,
  invincibleTimer: null,
  speedBoost: false,
  speedBoostTimer: null
};

// Create a consumable object
function createConsumable(type, platform) {
  const consumableEl = document.createElement('div');
  consumableEl.classList.add('consumable', type.className);
  gameContainer.appendChild(consumableEl);
  
  return {
    type: type.name,
    x: platform.x + (platform.width / 2) - (type.width / 2),
    y: platform.y - type.height - 5, // 5px above platform
    width: type.width,
    height: type.height,
    element: consumableEl
  };
}

// Update consumable positions
function updateConsumables() {
  platforms.forEach(platform => {
    if (platform.consumable) {
      // Update position based on platform
      platform.consumable.y = platform.y - platform.consumable.height - 5;
      
      // Update DOM element
      if (platform.consumable.element) {
        platform.consumable.element.style.left = platform.consumable.x + 'px';
        platform.consumable.element.style.top = platform.consumable.y + 'px';
      }
      
      // Check for collision with player
      if (isCollidingWithConsumable(player, platform.consumable)) {
        collectConsumable(platform.consumable);
        
        // Remove consumable from platform
        if (platform.consumable.element) {
          platform.consumable.element.remove();
        }
        platform.consumable = null;
      }
    }
  });
}

// Collect and apply consumable effect
function collectConsumable(consumable) {
  if (consumable.type === CONSUMABLE_TYPES.SPACE_STONE.name) {
    applySpaceStoneEffect();
    
    // Play collection sound effect (if available)
    if (window.collectSound) {
      collectSound.currentTime = 0;
      collectSound.play().catch(error => console.log("Sound play failed:", error));
    }
  }
  // Add other stone effects here
}

// Space Stone effect - invincibility with blue fire
function applySpaceStoneEffect() {
  // Clear any existing invincibility
  if (activeEffects.invincibleTimer) {
    clearTimeout(activeEffects.invincibleTimer);
  }
  
  // Apply invincibility
  activeEffects.invincible = true;
  
  // Add blue fire effect to feet
  addBlueFireEffect();
  
  // Add blue outline to character
  addBlueOutline();
  
  // Set timer to remove effect
  activeEffects.invincibleTimer = setTimeout(() => {
    activeEffects.invincible = false;
    removeBlueFireEffect();
    removeBlueOutline();
  }, CONSUMABLE_TYPES.SPACE_STONE.effectDuration);
}

// Add blue fire visual effect to player's feet
function addBlueFireEffect() {
  // Create fire container
  const fireContainer = document.createElement('div');
  fireContainer.id = 'blueFireEffect';
  fireContainer.style.position = 'absolute';
  fireContainer.style.bottom = '0';
  fireContainer.style.left = '50%';
  fireContainer.style.transform = 'translateX(-50%)';
  fireContainer.style.width = '100%';
  fireContainer.style.height = '30px';
  fireContainer.style.zIndex = '4';
  
  // Create individual flames
  for (let i = 0; i < 8; i++) {
    const flame = document.createElement('div');
    flame.className = 'flame';
    flame.style.position = 'absolute';
    flame.style.bottom = '0';
    flame.style.width = '10px';
    flame.style.height = '20px';
    flame.style.background = 'linear-gradient(to top, transparent, #00f, #0ff)';
    flame.style.borderRadius = '50% 50% 0 0';
    flame.style.filter = 'blur(2px)';
    flame.style.opacity = '0.7';
    flame.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
    flame.style.animationName = 'flicker';
    flame.style.animationIterationCount = 'infinite';
    flame.style.animationDirection = 'alternate';
    flame.style.left = (i * 12) + 'px';
    
    fireContainer.appendChild(flame);
  }
  
  // Add fire effect to player
  playerEl.appendChild(fireContainer);
  
  // Add animation to document if not already present
  if (!document.getElementById('blueFireAnimation')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'blueFireAnimation';
    styleSheet.textContent = `
      @keyframes flicker {
        0% { height: 20px; opacity: 0.7; }
        100% { height: 30px; opacity: 0.9; }
      }
    `;
    document.head.appendChild(styleSheet);
  }
  
  // Also add a glow to the player
  playerEl.style.filter = 'drop-shadow(0 0 10px rgba(0, 191, 255, 0.8))';
}

// Remove blue fire effect
function removeBlueFireEffect() {
  const fireEffect = document.getElementById('blueFireEffect');
  if (fireEffect) {
    fireEffect.remove();
  }
  
  // Remove glow
  playerEl.style.filter = '';
}

// Add blue outline to the character
function addBlueOutline() {
  // Add blue outline effect to character
  playerEl.style.boxShadow = '0 0 0 2px #00bfff, 0 0 8px 2px rgba(0, 191, 255, 0.6)';
  playerEl.style.borderRadius = '10px';
}

// Remove blue outline
function removeBlueOutline() {
  playerEl.style.boxShadow = '';
}

// Check if player is currently invincible
function isPlayerInvincible() {
  return activeEffects.invincible;
}

// Add a consumable to a platform
function addConsumableToPlatform(platform) {
  // Don't add consumables to platforms with enemies
  if (platform.enemy) return;
  
  // Random chance based on probability
  if (Math.random() < CONSUMABLE_TYPES.SPACE_STONE.spawnProbability) {
    platform.consumable = createConsumable(CONSUMABLE_TYPES.SPACE_STONE, platform);
  }
}