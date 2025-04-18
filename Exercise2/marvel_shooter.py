import pygame
import random
import math
import sys # To cleanly exit
import time
import webbrowser
import json

# --- Initialization ---
pygame.init()

# Screen dimensions
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("First Person Blaster")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)

# Clock (for controlling frame rate)
clock = pygame.time.Clock()
FPS = 60

# Font
font = pygame.font.Font(None, 36) # Default font, size 36
game_over_font = pygame.font.Font(None, 72)

# --- Asset Loading ---
try:
    # <<< === YOUR BACKGROUND IMAGE FILENAME IS HERE === >>>
    background_img_path = "Titan_background.png" # Your background file
    background_img = pygame.image.load(background_img_path).convert()
    background_img = pygame.transform.scale(background_img, (SCREEN_WIDTH, SCREEN_HEIGHT))
except FileNotFoundError:
    print(f"Error: Cannot find background image file: {background_img_path}")
    print("Please make sure the image file is in the same directory as the script, or provide the full path.")
    pygame.quit()
    sys.exit()

try:
    # <<< === YOUR ENEMY 1 IMAGE FILENAME IS HERE === >>>
    enemy1_img_path = "venom.png" # Your first enemy file
    enemy1_img = pygame.image.load(enemy1_img_path).convert_alpha() # Use convert_alpha() for transparency
    # Optional: Resize enemy images if needed (adjust the numbers)
    # enemy1_img = pygame.transform.scale(enemy1_img, (60, 80)) # Example resize for Venom
except FileNotFoundError:
    print(f"Error: Cannot find enemy 1 image file: {enemy1_img_path}")
    print("Please make sure the image file is in the same directory as the script, or provide the full path.")
    pygame.quit()
    sys.exit()

try:
    # <<< === YOUR ENEMY 2 IMAGE FILENAME IS HERE === >>>
    enemy2_img_path = "thanos.png" # Your second enemy file
    enemy2_img = pygame.image.load(enemy2_img_path).convert_alpha() # Use convert_alpha() for transparency
    # Optional: Resize enemy images if needed (adjust the numbers)
    # enemy2_img = pygame.transform.scale(enemy2_img, (70, 90)) # Example resize for Thanos
except FileNotFoundError:
    print(f"Error: Cannot find enemy 2 image file: {enemy2_img_path}")
    print("Please make sure the image file is in the same directory as the script, or provide the full path.")
    pygame.quit()
    sys.exit()

# --- Game Classes ---

class Enemy(pygame.sprite.Sprite):
    def __init__(self, image, speed_multiplier=1.0):
        super().__init__()
        self.image = image
        self.rect = self.image.get_rect()
        # Start at a random x position at the top
        self.rect.x = random.randint(0, SCREEN_WIDTH - self.rect.width)
        self.rect.y = -self.rect.height # Start just above the screen
        # Adjust speed here for a "decent pace"
        self.speed = random.uniform(1.5, 3.5) * speed_multiplier # Base speed + randomness + multiplier

    def update(self):
        # Move downwards towards the player
        self.rect.y += self.speed
        # Remove enemy if it goes way past the bottom (optional cleanup)
        if self.rect.top > SCREEN_HEIGHT + 50:
            self.kill()

class Bullet(pygame.sprite.Sprite):
    def __init__(self, start_x, start_y, target_x, target_y):
        super().__init__()
        self.image = pygame.Surface([8, 15]) # Small rectangle for the blast
        self.image.fill(YELLOW) # Yellow blasts
        self.rect = self.image.get_rect()
        self.rect.centerx = start_x
        self.rect.centery = start_y

        # Calculate direction vector
        dx = target_x - start_x
        dy = target_y - start_y
        distance = math.hypot(dx, dy)
        if distance == 0: # Avoid division by zero if click is exactly on player
            distance = 1
        self.vel_x = (dx / distance)
        self.vel_y = (dy / distance)
        self.speed = 12 # Speed of the blast

        # Store precise position as floats for smooth movement
        self.float_x = float(self.rect.centerx)
        self.float_y = float(self.rect.centery)

    def update(self):
        # Move the bullet
        self.float_x += self.vel_x * self.speed
        self.float_y += self.vel_y * self.speed
        self.rect.centerx = int(self.float_x)
        self.rect.centery = int(self.float_y)

        # Remove bullet if it goes off screen
        if (self.rect.bottom < 0 or self.rect.top > SCREEN_HEIGHT or
            self.rect.right < 0 or self.rect.left > SCREEN_WIDTH):
            self.kill()

# --- Game Variables ---
score = 0
game_over = False
running = True

# Sprite Groups (manage multiple sprites easily)
all_sprites = pygame.sprite.Group()
enemies = pygame.sprite.Group()
bullets = pygame.sprite.Group()

# Player's shooting origin (center bottom)
player_shoot_pos = (SCREEN_WIDTH // 2, SCREEN_HEIGHT - 10)

# Enemy Spawning Timer
enemy_spawn_delay = 1500 # milliseconds (1.5 seconds) - Adjust for difficulty
last_enemy_spawn_time = pygame.time.get_ticks()
enemy_images = [enemy1_img, enemy2_img] # List of enemy images to choose from
enemy_speed_multiplier = 1.0 # Increase this over time for difficulty

# Keyboard shooting direction (defaults to straight up)
key_shoot_target_x = SCREEN_WIDTH // 2
key_shoot_target_y = 0

# Add timer variables after other game variables
start_time = time.time()
game_duration = 15  # 15 seconds
time_left = game_duration

# --- Helper Functions ---
def draw_text(surf, text, size, x, y, color=WHITE):
    font = pygame.font.Font(None, size)
    text_surface = font.render(text, True, color)
    text_rect = text_surface.get_rect()
    text_rect.midtop = (x, y)
    surf.blit(text_surface, text_rect)

# --- Main Game Loop ---
while running:
    # Keep loop running at the right speed
    clock.tick(FPS)
    current_time = time.time()
    time_left = game_duration - (current_time - start_time)

    if time_left <= 0 and not game_over:
        # Time's up - send score back to platformer
        print(json.dumps({
            "type": "shooterComplete",
            "score": score,
            "gameOver": False
        }))
        running = False
        pygame.quit()
        sys.exit()

    # --- Event Handling ---
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        # Mouse Shooting
        if event.type == pygame.MOUSEBUTTONDOWN and not game_over:
            if event.button == 1: # Left mouse button
                mouse_x, mouse_y = event.pos
                bullet = Bullet(player_shoot_pos[0], player_shoot_pos[1], mouse_x, mouse_y)
                all_sprites.add(bullet)
                bullets.add(bullet)
        # Keyboard Input Handling
        if event.type == pygame.KEYDOWN and not game_over:
            # Set target based on arrow keys
            if event.key == pygame.K_LEFT:
                key_shoot_target_x = 0
                key_shoot_target_y = SCREEN_HEIGHT // 2 # Aim towards middle left
            elif event.key == pygame.K_RIGHT:
                key_shoot_target_x = SCREEN_WIDTH
                key_shoot_target_y = SCREEN_HEIGHT // 2 # Aim towards middle right
            elif event.key == pygame.K_UP:
                key_shoot_target_x = SCREEN_WIDTH // 2
                key_shoot_target_y = 0 # Aim straight up
            elif event.key == pygame.K_DOWN: # Maybe aim slightly lower? Optional.
                 key_shoot_target_x = SCREEN_WIDTH // 2
                 key_shoot_target_y = SCREEN_HEIGHT # Aim towards bottom (less useful)

            # Shoot with 'W' key
            if event.key == pygame.K_w:
                 bullet = Bullet(player_shoot_pos[0], player_shoot_pos[1], key_shoot_target_x, key_shoot_target_y)
                 all_sprites.add(bullet)
                 bullets.add(bullet)

        # Restart game after game over
        if game_over and event.type == pygame.KEYDOWN:
            if event.key == pygame.K_RETURN: # Press Enter to restart
                # Reset game state
                game_over = False
                score = 0
                all_sprites.empty()
                enemies.empty()
                bullets.empty()
                last_enemy_spawn_time = pygame.time.get_ticks()
                enemy_speed_multiplier = 1.0


    if not game_over:
        # --- Update ---
        # Spawn Enemies
        now = pygame.time.get_ticks()
        if now - last_enemy_spawn_time > enemy_spawn_delay:
            last_enemy_spawn_time = now
            enemy_img = random.choice(enemy_images) # Randomly selects venom.png or thanos.png
            enemy = Enemy(enemy_img, enemy_speed_multiplier)
            all_sprites.add(enemy)
            enemies.add(enemy)
            # Optional: Gradually decrease spawn delay and increase speed multiplier
            enemy_spawn_delay = max(300, enemy_spawn_delay * 0.99) # Decrease delay, min 0.3s
            enemy_speed_multiplier += 0.01 # Slowly increase speed


        # Update all sprites
        all_sprites.update()

        # Check for bullet-enemy collisions
        # pygame.sprite.groupcollide(group1, group2, dokill1, dokill2)
        # dokill means remove the sprite from the group upon collision
        hits = pygame.sprite.groupcollide(enemies, bullets, True, True)
        for hit in hits:
            score += 10 # Increase score for each hit

        # Check for enemy-player collision (enemy reaches bottom)
        for enemy in enemies:
            if enemy.rect.bottom >= SCREEN_HEIGHT:
                game_over = True
                # You could add an explosion effect here later
                break # No need to check others once game is over


        # --- Drawing ---
        # Draw background
        screen.blit(background_img, (0, 0))

        # Draw all sprites
        all_sprites.draw(screen)

        # Draw Score
        draw_text(screen, f"Score: {score}", 36, SCREEN_WIDTH // 2, 10)

        # Draw timer
        timer_text = f"Time: {int(time_left)}s"
        draw_text(screen, timer_text, 36, SCREEN_WIDTH - 100, 60)

    else: # --- Game Over Screen ---
        screen.blit(background_img, (0, 0)) # Optional: Keep background or black screen
        # screen.fill(BLACK) # Alternative: Black screen for game over
        draw_text(screen, "GAME OVER", 72, SCREEN_WIDTH // 2, SCREEN_HEIGHT // 4, RED)
        draw_text(screen, f"Final Score: {score}", 48, SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2)
        draw_text(screen, "Press ENTER to Restart", 30, SCREEN_WIDTH // 2, SCREEN_HEIGHT * 3 // 4)

        # Modify game over condition to communicate with platformer
        print(json.dumps({
            "type": "shooterComplete",
            "score": score,
            "gameOver": True
        }))
        running = False
        pygame.quit()
        sys.exit()

    # --- Display ---
    # After drawing everything, flip the display
    pygame.display.flip()

# --- Quit Pygame ---
pygame.quit()
sys.exit()