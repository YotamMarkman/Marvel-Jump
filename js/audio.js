// Audio control variables
let isMuted = false;
let muteButton; // DOM element for mute button

// Initialize audio controls
function initAudioControls() {
  // Create mute button element
  muteButton = document.createElement('div');
  muteButton.id = 'muteButton';
  muteButton.className = 'control-button';
  muteButton.innerHTML = '<i class="fas fa-volume-up"></i>'; // Using Font Awesome icons
  muteButton.style.position = 'absolute';
  muteButton.style.top = '10px';
  muteButton.style.right = '10px';
  muteButton.style.width = '40px';
  muteButton.style.height = '40px';
  muteButton.style.borderRadius = '50%';
  muteButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  muteButton.style.color = 'white';
  muteButton.style.display = 'flex';
  muteButton.style.justifyContent = 'center';
  muteButton.style.alignItems = 'center';
  muteButton.style.cursor = 'pointer';
  muteButton.style.zIndex = '999';
  muteButton.style.fontSize = '20px';
  muteButton.title = 'Mute/Unmute (Press M)';
  
  // Add to document
  document.getElementById('gameContainer').appendChild(muteButton);
  
  // Add click event listener
  muteButton.addEventListener('click', toggleMute);
  
  // Check if audio should be muted from previous session
  const savedMuteState = localStorage.getItem('isMuted');
  if (savedMuteState === 'true') {
    isMuted = true;
    updateMuteButton();
    updateAllAudioElements();
  }
}

// Toggle mute status for all audio elements
function toggleMute() {
  isMuted = !isMuted;
  updateMuteButton();
  updateAllAudioElements();
  
  // Save state to localStorage
  localStorage.setItem('isMuted', isMuted.toString());
}

// Update all audio elements based on mute state
function updateAllAudioElements() {
  // Update all audio elements
  const audioElements = [openingMusic, ironManMusic, spiderManMusic];
  audioElements.forEach(audio => {
    if (audio) {
      audio.muted = isMuted;
    }
  });
  
  // Also mute any sound effects that might be added later
  const allAudioElements = document.querySelectorAll('audio');
  allAudioElements.forEach(audio => {
    audio.muted = isMuted;
  });
}

// Update mute button appearance based on current state
function updateMuteButton() {
  if (muteButton) {
    if (isMuted) {
      muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>';
      muteButton.title = 'Unmute (Press M)';
    } else {
      muteButton.innerHTML = '<i class="fas fa-volume-up"></i>';
      muteButton.title = 'Mute (Press M)';
    }
  }
}

// Set mute state directly (useful for initialization)
function setMuteState(muted) {
  isMuted = muted;
  updateMuteButton();
  updateAllAudioElements();
  localStorage.setItem('isMuted', isMuted.toString());
}

// Get current mute state
function getMuteState() {
  return isMuted;
}