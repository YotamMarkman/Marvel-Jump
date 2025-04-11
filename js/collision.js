// Check if two objects are colliding (center-to-center collision detection)
function isColliding(obj1, obj2) {
    if (!obj2 || obj2.width === undefined || obj2.height === undefined) {
      return false;
    }
    
    // Calculate center points
    const obj1CenterX = obj1.x + (obj1.width / 2);
    const obj1CenterY = obj1.y + (obj1.height / 2);
    const obj2CenterX = obj2.x + (obj2.width / 2);
    const obj2CenterY = obj2.y + (obj2.height / 2);
    
    // Define collision box size
    const collisionWidth = 30;  // Half the enemy width
    const collisionHeight = 40; // Half the enemy height
    
    // Check if centers are within the collision box
    return Math.abs(obj1CenterX - obj2CenterX) < collisionWidth &&
           Math.abs(obj1CenterY - obj2CenterY) < collisionHeight;
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