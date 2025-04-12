// Main initialization function
function init() {
  // Initialize game elements
  initGameElements();
  
  // Initialize characters
  initCharacters();
  
  // Initialize platforms
  initPlatforms();
  
  // Set up input handlers
  setupInputHandlers();
  
  // Load background
  loadBackground();
  
  // Start opening music
  openingMusic.play().catch(function(error) {
    console.log("Audio play failed:", error);
  });
}

// Load the game when the window loads
window.addEventListener('load', init);