import pygame
import random
import sys
import os

pygame.init()
pygame.mixer.init()

# ---------------- SCREEN SETTINGS ----------------
WIDTH = 400
HEIGHT = 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("BATTA BOSS")

clock = pygame.time.Clock()

# ---------------- COLORS ----------------
SKY = (135, 206, 235)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (200, 0, 0)

# ---------------- LOAD IMAGES ----------------
ball_img = pygame.image.load("ball.jpeg").convert_alpha()
ball_img = pygame.transform.scale(ball_img, (40, 40))

cover_img = pygame.image.load("cover.jpeg").convert()
cover_img = pygame.transform.scale(cover_img, (WIDTH, HEIGHT))

pillar_images = [
    pygame.image.load("pic 1.jpeg").convert(),
    pygame.image.load("pic 2.jpeg").convert(),
    pygame.image.load("pic 3.jpeg").convert(),
    pygame.image.load("pic 4.jpeg").convert(),
    pygame.image.load("pic 5.jpeg").convert()
]

# ---------------- LOAD SOUNDS ----------------
jump_sound = pygame.mixer.Sound("jump.mp3")
crash_sound = pygame.mixer.Sound("crash.mp3")

jump_sound.set_volume(0.6)
crash_sound.set_volume(0.7)

# ---------------- FONTS ----------------
title_font = pygame.font.SysFont(None, 60)
menu_font = pygame.font.SysFont(None, 35)
score_font = pygame.font.SysFont(None, 35)

# ---------------- PLAYER ----------------
player = pygame.Rect(100, 250, 40, 40)
velocity = 0
gravity = 0.5
jump_power = -8

# ---------------- PIPES ----------------
pillar_width = 90
pillar_gap = 170
pillar_speed = 3
pillar_distance = 260
pillars = []

# ---------------- SCORE ----------------
score = 0
highscore = 0
game_active = False
crash_played = False
blink_timer = 0

# ---------------- LOAD HIGHSCORE ----------------
if os.path.exists("highscore.txt"):
    with open("highscore.txt", "r") as file:
        try:
            highscore = int(file.read())
        except:
            highscore = 0

def save_highscore():
    with open("highscore.txt", "w") as file:
        file.write(str(highscore))

# ---------------- CREATE PIPE ----------------
def create_pillar():
    height = random.randint(180, 420)
    image = random.choice(pillar_images)

    top_rect = pygame.Rect(WIDTH, 0, pillar_width, height - pillar_gap)
    bottom_rect = pygame.Rect(WIDTH, height, pillar_width, HEIGHT - height)

    return {
        "top": top_rect,
        "bottom": bottom_rect,
        "image": image,
        "scored": False
    }

def scale_to_pipe(image, width, height):
    if height <= 0:
        return None
    return pygame.transform.smoothscale(image, (width, height))

def draw_center_text(text, font, color, y):
    text_surface = font.render(text, True, color)
    text_rect = text_surface.get_rect(center=(WIDTH // 2, y))
    screen.blit(text_surface, text_rect)

def reset_game():
    global pillars, velocity, score, crash_played
    pillars.clear()
    player.y = 250
    velocity = 0
    score = 0
    crash_played = False

# ================= MAIN LOOP =================
while True:
    clock.tick(60)

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            save_highscore()
            pygame.quit()
            sys.exit()

        # ✅ Keyboard (PC)
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE:
                if game_active:
                    velocity = jump_power
                    jump_sound.play()
                else:
                    game_active = True
                    reset_game()

        # ✅ Mouse click (PC testing + Mobile tap)
        if event.type == pygame.MOUSEBUTTONDOWN:
            if game_active:
                velocity = jump_power
                jump_sound.play()
            else:
                game_active = True
                reset_game()

    if game_active:
        screen.fill(SKY)

        velocity += gravity
        player.y += velocity

        # Create pipes
        if len(pillars) == 0 or pillars[-1]["top"].x < WIDTH - pillar_distance:
            pillars.append(create_pillar())

        for pillar in pillars:
            pillar["top"].x -= pillar_speed
            pillar["bottom"].x -= pillar_speed

            top_img = scale_to_pipe(pillar["image"], pillar_width, pillar["top"].height)
            bottom_img = scale_to_pipe(pillar["image"], pillar_width, pillar["bottom"].height)

            if top_img:
                screen.blit(top_img, pillar["top"])
            if bottom_img:
                screen.blit(bottom_img, pillar["bottom"])

            # Collision
            if player.colliderect(pillar["top"]) or player.colliderect(pillar["bottom"]):
                if not crash_played:
                    crash_sound.play()
                    crash_played = True
                game_active = False

            # Score
            if pillar["top"].x + pillar_width < player.x and not pillar["scored"]:
                score += 1
                pillar["scored"] = True

                if score > highscore:
                    highscore = score
                    save_highscore()

        if pillars and pillars[0]["top"].x < -pillar_width:
            pillars.pop(0)

        # Ground / Ceiling collision
        if player.top < 0 or player.bottom > HEIGHT:
            if not crash_played:
                crash_sound.play()
                crash_played = True
            game_active = False

        screen.blit(ball_img, (player.x, player.y))

        # Show High Score ABOVE Score
        high_text = score_font.render(f"High Score: {highscore}", True, WHITE)
        screen.blit(high_text, (10, 10))

        score_text = score_font.render(f"Score: {score}", True, WHITE)
        screen.blit(score_text, (10, 45))

    else:
        screen.blit(cover_img, (0, 0))

        draw_center_text("BATTA BOSS", title_font, RED, 200)

        # Blinking Tap to Start
        blink_timer += 1
        if (blink_timer // 30) % 2 == 0:
            draw_center_text("Tap or Press SPACE to Start", menu_font, BLACK, 300)

        draw_center_text(f"High Score: {highscore}", menu_font, BLACK, 350)

    pygame.display.update()