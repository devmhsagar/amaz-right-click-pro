import os
from PIL import Image, ImageDraw

def create_icon(size, filename):
    # Create image with RGBA
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    s = size / 128.0
    
    # Outer circle / rounded rectangle background with rich gradient
    # Since PIL simple drawing doesn't do radial gradients easily, we create smooth gradient steps
    bg_color_start = (20, 30, 48)     # Dark slate
    bg_color_end = (36, 198, 220)     # Vibrant cyan
    
    margin = int(4 * s)
    radius = int(28 * s)
    
    # Draw rounded rect background
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=radius,
        fill=(15, 23, 42, 255) # Sleek slate 900
    )
    
    # Inner border / ring
    draw.rounded_rectangle(
        [margin + 1, margin + 1, size - margin - 1, size - margin - 1],
        radius=radius,
        outline=(56, 189, 248, 200), # Sky blue glow
        width=max(1, int(3 * s))
    )
    
    # Draw Computer Mouse & Right-Click Accent + Unlocked Padlock
    # Mouse body: center x = 50*s, width = 36*s, height = 56*s
    mx = int(48 * s)
    my = int(36 * s)
    mw = int(34 * s)
    mh = int(54 * s)
    
    # Mouse rounded contour
    draw.rounded_rectangle(
        [mx, my, mx + mw, my + mh],
        radius=int(16 * s),
        fill=(30, 41, 59, 255),
        outline=(148, 163, 184, 255),
        width=max(1, int(2 * s))
    )
    
    # Split mouse top (left vs right click button)
    center_line_x = mx + mw // 2
    top_split_y = my + int(24 * s)
    
    # Highlight the RIGHT button (the Right Click!) in bright glowing cyan/emerald
    draw.rounded_rectangle(
        [center_line_x, my, mx + mw, top_split_y],
        radius=int(4 * s),
        fill=(16, 185, 129, 255) # Emerald green highlight for right click
    )
    
    # Separator lines on mouse
    draw.line([(center_line_x, my), (center_line_x, top_split_y)], fill=(15, 23, 42, 255), width=max(1, int(2 * s)))
    draw.line([(mx, top_split_y), (mx + mw, top_split_y)], fill=(148, 163, 184, 200), width=max(1, int(2 * s)))
    
    # Scroll wheel
    wheel_w = int(4 * s)
    wheel_h = int(10 * s)
    wheel_x = center_line_x - wheel_w // 2
    wheel_y = my + int(6 * s)
    draw.rounded_rectangle(
        [wheel_x, wheel_y, wheel_x + wheel_w, wheel_y + wheel_h],
        radius=int(2 * s),
        fill=(248, 250, 252, 255)
    )
    
    # Draw Unlocked Lock on bottom right
    # Lock body: center x=90*s, y=86*s
    lx = int(72 * s)
    ly = int(72 * s)
    lw = int(38 * s)
    lh = int(32 * s)
    
    # Lock body (golden amber / bright yellow)
    draw.rounded_rectangle(
        [lx, ly, lx + lw, ly + lh],
        radius=int(6 * s),
        fill=(245, 158, 11, 255), # Amber 500
        outline=(251, 191, 36, 255),
        width=max(1, int(2 * s))
    )
    
    # Keyhole in lock body
    kh_x = lx + lw // 2
    kh_y = ly + int(12 * s)
    draw.ellipse([kh_x - int(3 * s), kh_y - int(3 * s), kh_x + int(3 * s), kh_y + int(3 * s)], fill=(120, 53, 15, 255))
    draw.polygon([
        (kh_x - int(2 * s), kh_y),
        (kh_x + int(2 * s), kh_y),
        (kh_x + int(3 * s), kh_y + int(10 * s)),
        (kh_x - int(3 * s), kh_y + int(10 * s))
    ], fill=(120, 53, 15, 255))
    
    # Open Shackle (unlocked!)
    # Shackle arch curving up and open to right
    shackle_left = lx + int(8 * s)
    shackle_w = int(22 * s)
    shackle_top = ly - int(18 * s)
    shackle_h = int(22 * s)
    shackle_thick = max(1, int(4 * s))
    
    # Draw shackle arch
    draw.arc(
        [shackle_left, shackle_top, shackle_left + shackle_w, shackle_top + shackle_h],
        start=180, end=360,
        fill=(226, 232, 240, 255),
        width=shackle_thick
    )
    # Left stem connecting to lock
    draw.line([(shackle_left, shackle_top + shackle_h // 2), (shackle_left, ly)], fill=(226, 232, 240, 255), width=shackle_thick)
    # Right stem lifted up (OPEN position)
    draw.line([(shackle_left + shackle_w, shackle_top + shackle_h // 2), (shackle_left + shackle_w, shackle_top + shackle_h // 2 + int(4 * s))], fill=(226, 232, 240, 255), width=shackle_thick)
    
    # Save image
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    img.save(filename, 'PNG')
    print(f"Generated {filename} ({size}x{size})")

if __name__ == '__main__':
    create_icon(16, '/home/amaz-soft-m/projects/amaz_right_click/icons/icon-16.png')
    create_icon(48, '/home/amaz-soft-m/projects/amaz_right_click/icons/icon-48.png')
    create_icon(128, '/home/amaz-soft-m/projects/amaz_right_click/icons/icon-128.png')
