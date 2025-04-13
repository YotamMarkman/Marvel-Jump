// Main initialization function
function init() {
  // Initialize game elements
  initGameElements();
  
  // Initialize characters
  initCharacters();
  
  // Initialize platforms
  initPlatforms();
  
  // Initialize audio controls
  initAudioControls();
  
  // Set up input handlers
  setupInputHandlers();
  
  // Load background
  loadBackground();
  
  // Start opening music
  openingMusic.play().catch(function(error) {
    console.log("Audio play failed:", error);
  });
  
  // Apply mute state if needed
  if (getMuteState()) {
    updateAllAudioElements();
  }
}

// Load the game when the window loads
window.addEventListener('load', init);