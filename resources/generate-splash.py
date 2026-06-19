import os
from PIL import Image, ImageDraw, ImageFont

BASE_COLOR = (237, 228, 216)  # #EDE4D8
TEXT_COLOR = (217, 119, 69)   # #D97745
FLAG_GREEN = (0, 158, 73)
FLAG_YELLOW = (252, 209, 22)
FLAG_BLUE = (58, 117, 196)

def get_font(size):
    """Try to find a usable font on the system."""
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
        "/usr/share/fonts/TTF/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    ]
    for c in candidates:
        if os.path.exists(c):
            try:
                return ImageFont.truetype(c, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_book(draw, cx, cy, size):
    """Draw a simple open book icon."""
    s = size
    # left page
    draw.polygon([
        (cx - s*0.45, cy - s*0.25),
        (cx - s*0.05, cy - s*0.35),
        (cx - s*0.05, cy + s*0.35),
        (cx - s*0.45, cy + s*0.25)
    ], outline=TEXT_COLOR, width=max(2, int(s*0.04)))
    # right page
    draw.polygon([
        (cx + s*0.05, cy - s*0.35),
        (cx + s*0.45, cy - s*0.25),
        (cx + s*0.45, cy + s*0.25),
        (cx + s*0.05, cy + s*0.35)
    ], outline=TEXT_COLOR, width=max(2, int(s*0.04)))
    # spine
    draw.line([(cx, cy - s*0.35), (cx, cy + s*0.35)], fill=TEXT_COLOR, width=max(2, int(s*0.04)))
    # bottom binding
    draw.line([(cx - s*0.45, cy + s*0.25), (cx + s*0.45, cy + s*0.25)], fill=TEXT_COLOR, width=max(2, int(s*0.04)))
    # top curve
    draw.arc([cx - s*0.45, cy - s*0.35 - s*0.08, cx - s*0.05, cy - s*0.35 + s*0.08], start=0, end=180, fill=TEXT_COLOR, width=max(2, int(s*0.04)))
    draw.arc([cx + s*0.05, cy - s*0.35 - s*0.08, cx + s*0.45, cy - s*0.35 + s*0.08], start=0, end=180, fill=TEXT_COLOR, width=max(2, int(s*0.04)))

def draw_gabon_flag(draw, cx, cy, w, h):
    stripe_h = h // 3
    draw.rectangle([cx - w//2, cy - h//2, cx + w//2, cy - h//2 + stripe_h], fill=FLAG_GREEN)
    draw.rectangle([cx - w//2, cy - h//2 + stripe_h, cx + w//2, cy - h//2 + 2*stripe_h], fill=FLAG_YELLOW)
    draw.rectangle([cx - w//2, cy - h//2 + 2*stripe_h, cx + w//2, cy + h//2], fill=FLAG_BLUE)

def draw_geometric(draw, width, height, scale):
    s = scale
    # left branch
    draw.line([(0, height*0.5), (width*0.2, height*0.83), (width*0.4, height*0.92)], fill=(*TEXT_COLOR, 90), width=max(1, int(s*0.015)))
    # right branch
    draw.line([(width, height*0.5), (width*0.8, height*0.83), (width*0.6, height*0.92)], fill=(*TEXT_COLOR, 90), width=max(1, int(s*0.015)))
    # circles
    for x, y, r in [(width*0.08, height*0.75, s*0.01), (width*0.92, height*0.75, s*0.01),
                    (width*0.125, height*0.83, s*0.006), (width*0.875, height*0.83, s*0.006),
                    (width*0.175, height*0.73, s*0.005), (width*0.825, height*0.73, s*0.005)]:
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(*TEXT_COLOR, 120))
    # triangles
    for points in [(width*0.225, height*0.875, width*0.238, height*0.937, width*0.212, height*0.937),
                   (width*0.775, height*0.875, width*0.788, height*0.937, width*0.762, height*0.937)]:
        draw.polygon(list(points), fill=(*TEXT_COLOR, 110))
    # squares
    sq = s * 0.015
    draw.rectangle([width*0.275 - sq/2, height*0.83 - sq/2, width*0.275 + sq/2, height*0.83 + sq/2], fill=(*TEXT_COLOR, 90))
    draw.rectangle([width*0.725 - sq/2, height*0.83 - sq/2, width*0.725 + sq/2, height*0.83 + sq/2], fill=(*TEXT_COLOR, 90))

def generate_splash(size, out_path):
    img = Image.new('RGB', (size, size), BASE_COLOR)
    draw = ImageDraw.Draw(img)
    
    scale = size / 800.0
    
    # Fonts
    font_small = get_font(int(14 * scale))
    font_title = get_font(int(36 * scale))
    font_medium = get_font(int(18 * scale))
    
    # Top text
    top_text = "langue nzébi officiel"
    bbox = draw.textbbox((0,0), top_text, font=font_small)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, size * 0.08), top_text, fill=TEXT_COLOR, font=font_small)
    
    # Book icon
    book_y = size * 0.28
    book_size = size * 0.18
    draw_book(draw, size / 2, book_y, book_size)
    
    # Title
    title_text = "Dictionnaire inzèbi"
    bbox = draw.textbbox((0,0), title_text, font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, size * 0.42), title_text, fill=TEXT_COLOR, font=font_title)
    
    # Flag
    flag_y = size * 0.55
    flag_w = int(size * 0.1)
    flag_h = int(size * 0.067)
    draw_gabon_flag(draw, size / 2, flag_y, flag_w, flag_h)
    
    # Orange line
    line_w = size * 0.12
    line_y = size * 0.62
    draw.rectangle([size/2 - line_w/2, line_y, size/2 + line_w/2, line_y + max(2, int(scale*3))], fill=TEXT_COLOR)
    
    # Bottom text
    bottom_text = "langue nzébi officiel"
    bbox = draw.textbbox((0,0), bottom_text, font=font_small)
    tw = bbox[2] - bbox[0]
    draw.text(((size - tw) / 2, size * 0.92), bottom_text, fill=TEXT_COLOR, font=font_small)
    
    # Geometric decorations in bottom area (use a temporary overlay for transparency)
    # We'll draw on an overlay
    overlay = Image.new('RGBA', (size, size), (0,0,0,0))
    overlay_draw = ImageDraw.Draw(overlay)
    draw_geometric(overlay_draw, size, size, scale)
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, overlay)
    img = img.convert('RGB')
    
    img.save(out_path, "PNG")
    print(f"Saved {out_path} ({size}x{size})")

os.makedirs("resources/splash/ios", exist_ok=True)
os.makedirs("resources/splash/android", exist_ok=True)

# iOS sizes
ios_sizes = [2732, 2208, 2048, 1668, 1536, 1170, 1125, 1242, 750, 640]
for s in ios_sizes:
    generate_splash(s, f"resources/splash/ios/splash-{s}x{s}.png")

# Android sizes
android_sizes = [2880, 1920, 1440, 960, 720]
for s in android_sizes:
    generate_splash(s, f"resources/splash/android/splash-{s}x{s}.png")

print("Done!")
