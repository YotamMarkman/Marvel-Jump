// Score variables
let score = 0;
let highScore = 0;
let absoluteHeight = 0;
let highestPlatformIndex = -1;

// Initialize score elements
function initScore() {
  highScore = parseInt(localStorage.getItem("highScore") || "0");
  document.getElementById('highScoreDisplay').textContent = "High Score: " + highScore;
}

// Update score when player reaches a new platform
function updateScore(platformId) {
  if (platformId > highestPlatformIndex) {
    let platform = platforms.find(p => p.id === platformId);
    if (platform && platform.isFirstPlatform) return;
    
    const levelsJumped = platformId - highestPlatformIndex;
    const scoreIncrement = levelsJumped * 10;
    const newScore = score + scoreIncrement;
    
    // Check if this platform or the next would be a 100-point milestone
    if (newScore % 100 === 0) {
      platform.isMilestone = true;
      platform.milestoneValue = newScore; // Set to actual score value
    } else if ((newScore + 10) % 100 === 0 && platform.id + 1 <= platforms.length) {
      // Find the next platform and mark it as a milestone
      const nextPlatform = platforms.find(p => p.id === platform.id + 1);
      if (nextPlatform) {
        nextPlatform.isMilestone = true;
        nextPlatform.milestoneValue = newScore + 10;
      }
    }
    
    score = newScore;
    highestPlatformIndex = platformId;
    document.getElementById('scoreDisplay').textContent = "Score: " + score;
    
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
      document.getElementById('highScoreDisplay').textContent = "High Score: " + highScore;
    }
    
    if (currentPlatform) {
      currentPlatform.fallCountdown = getFallCountdown();
    }
    
    flashScoreDisplay();
  }
}

// Visual feedback when score updates
function flashScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  const oldColor = scoreDisplay.style.color;
  scoreDisplay.style.color = "#FFFF00";
  setTimeout(() => {
    scoreDisplay.style.color = oldColor;
  }, 300);
}

// Show game over overlay with final score
function showGameOverOverlay() {
  gameOver = true;
  
  // Stop music
  if (currentGameMusic) {
    currentGameMusic.pause();
    currentGameMusic.currentTime = 0;
  }
  
  // Update leaderboard
  const leaderboard = updateLeaderboard(score);
  document.getElementById('finalScoreDisplay').textContent = "Your Score: " + score;
  
  // Clear and update leaderboard display
  const leaderboardList = document.getElementById('leaderboardList');
  leaderboardList.innerHTML = "";
  
  // Add header for top 5
  const header = document.createElement("h3");
  header.textContent = "Top 5 Best Scores";
  header.style.marginBottom = "10px";
  
  if (!leaderboardList.previousElementSibling || leaderboardList.previousElementSibling.tagName !== 'H3') {
    leaderboardList.before(header);
  }
  
  // Add leaderboard entries
  leaderboard.forEach((s) => {
    let li = document.createElement("li");
    li.style.fontSize = "24px";
    li.style.marginBottom = "5px";
    li.textContent = s;
    leaderboardList.appendChild(li);
  });
  
  // Show overlay
  document.getElementById('gameOverOverlay').style.display = "block";
}

// Update leaderboard with new score
function updateLeaderboard(finalScore) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push(finalScore);
  leaderboard.sort((a, b) => b - a);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  return leaderboard;
}

// Get platform fall countdown time based on score
function getFallCountdown() {
  const baseTime = 5;
  const minTime = 0.5;
  const firstThreshold = 100;
  const secondThreshold = 150;
  const firstTimeDecrease = 0.5;
  const secondTimeDecrease = 0.1;
  const firstDecreaseCount = Math.floor(score / firstThreshold);
  
  let newTime = Math.max(baseTime - (firstDecreaseCount * firstTimeDecrease), 1);
  
  if (newTime <= 1) {
    const secondDecreaseCount = Math.floor((score - (firstThreshold * 8)) / secondThreshold);
    newTime = Math.max(1 - (secondDecreaseCount * secondTimeDecrease), minTime);
  }
  
  return newTime;
}

// Draw score display
function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = "20px Arial";
  
  ctx.textAlign = "left";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.strokeText("Score: " + score, 20, 30);

  ctx.textAlign = "right";
  ctx.fillText("High Score: " + highScore, canvas.width - 20, 30);
  ctx.strokeText("High Score: " + highScore, canvas.width - 20, 30);
}