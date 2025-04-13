// Key states
let keys = [];

// Set up input handlers
function setupInputHandlers() {
  // Keyboard input for movement and actions
  window.addEventListener('keydown', function(e) {
    keys[e.keyCode] = true;
    
    // Jump on Space (key code 32)
    if (e.keyCode === 32 && !player.jumping) {
      playerJump();
    }
    
    // Shoot upward on "W" (keycode 87)
    if (e.keyCode === 87) {
      shootUp();
    }
    
    // Mute/unmute on "M" (keycode 77)
    if (e.keyCode === 77) {
      toggleMute();
    }
    
    // Character selection with keyboard
    if (document.getElementById('characterSelect').style.display !== 'none') {
      if (e.key.toLowerCase() === 'i') {
        selectCharacter('ironman');
      } else if (e.key.toLowerCase() === 's') {
        selectCharacter('spiderman');
      }
    }
  });

  window.addEventListener('keyup', function(e) {
    keys[e.keyCode] = false;
  });
  
  // Game Over controls
  document.addEventListener('keydown', function(e) {
    if (gameOver) {
      if (e.key === 'q' || e.key === 'Q') {
        quitGame();
      }
      if (e.key === 'r' || e.keyCode === 32) {
        location.reload();
      }
    }
  });

  // Play Again button
  document.getElementById('playAgainButton').addEventListener("click", function() {
    location.reload();
  });
}