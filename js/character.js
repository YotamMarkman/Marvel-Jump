// Audio elements
let openingMusic;
let ironManMusic;
let spiderManMusic;
let currentGameMusic = null;

// Player variables
let player = {
  x: 180,
  y: 450,
  width: 80,
  height: 140,
  speed: 5,
  velX: 0,
  velY: 0,
  jumping: false
};

let selectedCharacter = null;
let playerEl;

// Initialize character selection elements
function initCharacters() {
  playerEl = document.getElementById('playerCharacter');
  openingMusic = document.getElementById('openingMusic');
  ironManMusic = document.getElementById('ironManMusic');
  spiderManMusic = document.getElementById('spiderManMusic');
  
  // Apply initial mute state to audio elements
  const savedMuteState = localStorage.getItem('isMuted');
  if (savedMuteState === 'true') {
    [openingMusic, ironManMusic, spiderManMusic].forEach(audio => {
      if (audio) {
        audio.muted = true;
      }
    });
  }
  
  // Add click listeners to character options
  document.querySelectorAll('.character-option').forEach(option => {
    option.addEventListener('click', () => {
      selectCharacter(option.dataset.character);
    });
  });
}

// Select a character and start the game
function selectCharacter(character) {
  selectedCharacter = character;
  document.getElementById('characterSelect').style.display = 'none';
  
  // Stop the opening music
  openingMusic.pause();
  openingMusic.currentTime = 0;

  // Start character-specific music
  if (character === 'ironman') {
    ironManMusic.play().catch(error => console.log("Audio play failed:", error));
    currentGameMusic = ironManMusic;
  } else if (character === 'spiderman') {
    spiderManMusic.play().catch(error => console.log("Audio play failed:", error));
    currentGameMusic = spiderManMusic;
  }
  
  // Apply mute state if needed
  if (getMuteState() && currentGameMusic) {
    currentGameMusic.muted = true;
  }

  // Apply character settings
  playerEl.classList.remove('ironman', 'spiderman');
  const settings = CHARACTER_SETTINGS[character];
  playerEl.classList.add(settings.className);
  player.width = settings.width;
  player.height = settings.height;
  
  // Start the game
  startGame();
}

// Make player jump
function playerJump() {
  if (!player.jumping) {
    player.jumping = true;
    player.velY = GAME_CONSTANTS.BASE_JUMP - Math.abs(player.velX);
    currentPlatform = null;
    if (!playerEl.classList.contains('jump')) {
      playerEl.classList.add('jump');
      setTimeout(() => {
        playerEl.classList.remove('jump');
      }, 300);
    }
    return true;
  }
  return false;
}

// Shoot bullet upward
function shootUp() {
  const bullet = document.createElement('div');
  bullet.classList.add('bullet', 'shootUp');
  
  const rect = playerEl.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();
  const startX = rect.left - containerRect.left + (rect.width / 2) - 3;
  const startY = rect.top - containerRect.top;
  
  bullet.style.left = startX + 'px';
  bullet.style.top = startY + 'px';
  
  gameContainer.appendChild(bullet);
  bullet.addEventListener('animationend', () => {
    bullet.remove();
  });
}

// Update player position based on physics
function updatePlayer() {
  // Apply physics
  player.velX *= GAME_CONSTANTS.FRICTION;
  player.velY += GAME_CONSTANTS.GRAVITY;
  player.x += player.velX;
  player.y += player.velY;
  
  // Handle boundaries
  if (player.x >= canvas.width - player.width) {
    player.x = canvas.width - player.width;
  } else if (player.x <= 0) {
    player.x = 0;
  }
  
  // Check if player fell off the bottom
  if (player.y > canvas.height && score >= 50) {
    showGameOverOverlay();
    gameOver = true;
  } else if (player.y > canvas.height) {
    player.y = canvas.height - player.height;
    player.velY = GAME_CONSTANTS.BASE_JUMP;
    player.jumping = false;
  }
  
  // Update DOM element position
  playerEl.style.left = player.x + "px";
  playerEl.style.top = player.y + "px";
}