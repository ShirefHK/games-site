"""Re-skins game images: redraws sprites/shapes where the layout is known and
re-colours the rest with the same palette as tools/palette.js.
Run ONCE from the repo root:  python tools/reskin-assets.py   (use --force to run again)
Originals are kept in git history (git checkout -- games/*/images to undo)."""
import os, sys, math, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageChops

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
G = os.path.join(ROOT, 'games')
MARK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.assets-done')
if os.path.exists(MARK) and '--force' not in sys.argv:
    print('already applied (delete tools/.assets-done or use --force)'); sys.exit(0)

# ------------------------------------------------------------------ palette (mirror of palette.js)
HUE_IN = [0, 30, 60, 120, 180, 240, 280, 330, 360]
HUE_OUT = [335, 372, 400, 525, 550, 615, 645, 680, 695]
STOP_X = [0, .5, 1]
STOP_C = np.array([[13, 5, 24], [92, 54, 156], [238, 230, 253]], dtype=np.float32)

def map_hue(h):
    h = np.mod(h, 360)
    return np.mod(np.interp(h, HUE_IN, HUE_OUT), 360)

def rgb2hsl(rgb):
    r, g, b = rgb[..., 0] / 255, rgb[..., 1] / 255, rgb[..., 2] / 255
    mx, mn = np.maximum(np.maximum(r, g), b), np.minimum(np.minimum(r, g), b)
    l = (mx + mn) / 2
    d = mx - mn
    s = np.where(d == 0, 0, np.where(l > .5, d / np.maximum(2 - mx - mn, 1e-6), d / np.maximum(mx + mn, 1e-6)))
    dd = np.maximum(d, 1e-6)
    h = np.where(mx == r, (g - b) / dd + np.where(g < b, 6, 0), np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) * 60
    h = np.where(d == 0, 0, h)
    return h, s, l

def hsl2rgb(h, s, l):
    h = np.mod(h, 360) / 360
    q = np.where(l < .5, l * (1 + s), l + s - l * s)
    p = 2 * l - q
    def f(t):
        t = np.mod(t, 1)
        return np.where(t < 1 / 6, p + (q - p) * 6 * t, np.where(t < .5, q, np.where(t < 2 / 3, p + (q - p) * (2 / 3 - t) * 6, p)))
    out = np.stack([f(h + 1 / 3), f(h), f(h - 1 / 3)], -1) * 255
    gray = np.stack([l * 255] * 3, -1)
    return np.where((s == 0)[..., None], gray, out)

def map_rgb(rgb):
    rgb = rgb.astype(np.float32)
    h, s, l = rgb2hsl(rgb)
    lum = (.2126 * rgb[..., 0] + .7152 * rgb[..., 1] + .0722 * rgb[..., 2]) / 255
    chroma = (rgb.max(-1) - rgb.min(-1)) / 255
    neutral = np.stack([np.interp(lum, STOP_X, STOP_C[:, k]) for k in range(3)], -1)
    hs = hsl2rgb(map_hue(h), np.minimum(1, s * 1.08) * 0 + np.minimum(1, s * 1.4 + .15), l)
    k = np.clip(chroma / .14, 0, 1)[..., None]
    soft = neutral * (1 - k) + hs * k
    sat = hsl2rgb(map_hue(h), np.minimum(1, s * 1.08), np.clip(l * .96 + .02, .06, .92))
    return np.where((chroma < .14)[..., None], soft, sat)

def recolor(im):
    im = im.convert('RGBA')
    a = np.array(im)
    a[..., :3] = np.clip(map_rgb(a[..., :3]), 0, 255).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')

SYN_X = [0, .35, .7, 1]
SYN_C = np.array([[13, 5, 24], [92, 40, 150], [255, 79, 163], [255, 196, 110]], dtype=np.float32)

def synth(im, k=.7):
    """synthwave gradient-map of the luminance, blended with the normal re-colour"""
    im = im.convert('RGBA')
    a = np.array(im)
    rgb = a[..., :3].astype(np.float32)
    lum = (.2126 * rgb[..., 0] + .7152 * rgb[..., 1] + .0722 * rgb[..., 2]) / 255
    lum = np.clip((lum - .08) * 1.12, 0, 1)
    gm = np.stack([np.interp(lum, SYN_X, SYN_C[:, c]) for c in range(3)], -1)
    base = map_rgb(rgb)
    a[..., :3] = np.clip(gm * k + base * (1 - k), 0, 255).astype(np.uint8)
    return Image.fromarray(a, 'RGBA')

STYLIZE = {
    '08 Outrun/images/bg.png': .72, '08 Outrun/images/1.png': .55, '08 Outrun/images/2.png': .55, '08 Outrun/images/3.png': .55,
    '08 Outrun/images/4.png': .55, '08 Outrun/images/5.png': .55, '08 Outrun/images/6.png': .55, '08 Outrun/images/7.png': .55,
    '15 Volleyball/images/background.PNG': .75, '07 Racing (Top Down)/images/background.png': .6,
    '13 Tron/background.jpg': .8, '14 Chess/images/board.png': .85, '14 Chess/images/board0.png': .85, '12 Mahjong Solitaire/files/background.png': .75,
}

def recolor_file(path, k=None):
    im = Image.open(path)
    out = synth(im, k) if k else recolor(im)
    if path.lower().endswith(('.jpg', '.jpeg')):
        out.convert('RGB').save(path, quality=92)
    else:
        out.save(path)

# ------------------------------------------------------------------ drawing helpers
SS = 4
INK = (13, 5, 24)
PINK, CYAN, AMBER, MINT = (255, 79, 163), (56, 225, 255), (255, 180, 84), (61, 224, 176)
VIOLET, CORAL, BLUE, LAV = (163, 98, 255), (255, 122, 89), (79, 139, 255), (204, 214, 246)

def canvas(w, h, color=(0, 0, 0, 0)):
    return Image.new('RGBA', (w * SS, h * SS), color)

def finish(im, w, h):
    return im.resize((w, h), Image.LANCZOS)

def lighten(c, t):
    return tuple(int(v + (255 - v) * t) for v in c)

def darken(c, t):
    return tuple(int(v * (1 - t)) for v in c)

def vgrad(w, h, top, bottom):
    a = np.zeros((h, w, 4), dtype=np.uint8)
    t = np.linspace(0, 1, h)[:, None]
    for k in range(3):
        a[..., k] = (top[k] + (bottom[k] - top[k]) * t).astype(np.uint8)
    a[..., 3] = 255
    return Image.fromarray(a, 'RGBA')

def glow(im, radius, boost=1.0):
    g = im.filter(ImageFilter.GaussianBlur(radius * SS))
    if boost != 1.0:
        a = np.array(g).astype(np.float32); a[..., 3] = np.clip(a[..., 3] * boost, 0, 255); g = Image.fromarray(a.astype(np.uint8), 'RGBA')
    return Image.alpha_composite(g, im)

def rrect(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle([v * SS for v in box], radius=r * SS, fill=fill, outline=outline, width=width * SS)

def glass_tile(w, h, base, radius=4, margin=0):
    """neon-glass tile: gradient body, dark rim, top sheen"""
    im = canvas(w, h)
    body = vgrad(w * SS, h * SS, lighten(base, .35), darken(base, .28))
    mask = Image.new('L', (w * SS, h * SS), 0)
    ImageDraw.Draw(mask).rounded_rectangle([margin * SS, margin * SS, (w - margin) * SS - 1, (h - margin) * SS - 1], radius=radius * SS, fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([margin * SS, margin * SS, (w - margin) * SS - 1, (h - margin) * SS - 1], radius=radius * SS, outline=INK + (255,), width=int(1.2 * SS))
    # inner light edge + sheen
    d.rounded_rectangle([(margin + 1.6) * SS, (margin + 1.6) * SS, (w - margin - 1.6) * SS, (h - margin - 1.6) * SS], radius=(radius - 1) * SS, outline=lighten(base, .55) + (150,), width=int(.8 * SS))
    sheen = Image.new('RGBA', im.size, (0, 0, 0, 0))
    ImageDraw.Draw(sheen).rounded_rectangle([(margin + 2.5) * SS, (margin + 2.2) * SS, (w - margin - 2.5) * SS, (h * .45) * SS], radius=(radius - 1) * SS, fill=(255, 255, 255, 70))
    return Image.alpha_composite(im, sheen)

def poly_pts(cx, cy, r, n, rot=0, inner=None):
    pts = []
    k = n * 2 if inner else n
    for i in range(k):
        rr = r if (not inner or i % 2 == 0) else inner
        ang = rot + i * math.pi * 2 / k
        pts.append((cx + rr * math.cos(ang), cy + rr * math.sin(ang)))
    return pts

def shape_gem(size, pts, base):
    """filled polygon with gradient, rim and highlight; pts are in 1x coordinates"""
    im = canvas(size, size)
    body = vgrad(size * SS, size * SS, lighten(base, .45), darken(base, .35))
    mask = Image.new('L', (size * SS, size * SS), 0)
    sp = [(x * SS, y * SS) for x, y in pts]
    ImageDraw.Draw(mask).polygon(sp, fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.line(sp + [sp[0]], fill=INK + (255,), width=int(1.6 * SS), joint='curve')
    cx = sum(p[0] for p in sp) / len(sp); cy = sum(p[1] for p in sp) / len(sp)
    for i in range(len(sp)):  # facet lines to the centre
        d.line([sp[i], (cx, cy)], fill=lighten(base, .6) + (70,), width=int(.7 * SS))
    d.ellipse([cx - 5 * SS, cy - 8 * SS, cx - 1 * SS, cy - 4 * SS], fill=(255, 255, 255, 140))
    return im

def save(im, rel):
    im.save(os.path.join(G, rel))

def font(size, bold=True):
    for f in ('segoeuib.ttf', 'arialbd.ttf', 'verdanab.ttf'):
        try:
            return ImageFont.truetype('C:/Windows/Fonts/' + f, size)
        except Exception:
            pass
    return ImageFont.load_default()

def night_bg(w, h, seed=1, grid=None, glows=((0.2, 0.15, 260, VIOLET), (0.85, 0.7, 300, PINK)), stars=60):
    rnd = random.Random(seed)
    im = vgrad(w, h, (20, 8, 40), (9, 3, 20))
    ov = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    for fx, fy, rad, col in glows:
        g = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(g).ellipse([fx * w - rad, fy * h - rad, fx * w + rad, fy * h + rad], fill=col + (70,))
        ov = Image.alpha_composite(ov, g.filter(ImageFilter.GaussianBlur(rad / 2.2)))
    im = Image.alpha_composite(im, ov)
    lay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    if grid:
        for x in range(0, w, grid):
            d.line([(x, 0), (x, h)], fill=VIOLET + (22,))
        for y in range(0, h, grid):
            d.line([(0, y), (w, y)], fill=VIOLET + (22,))
    for _ in range(stars):
        x, y = rnd.randrange(w), rnd.randrange(h)
        c = rnd.choice([LAV, CYAN, PINK])
        d.point((x, y), fill=c + (rnd.randrange(80, 220),))
    im = Image.alpha_composite(im, lay)
    return im

# ------------------------------------------------------------------ per-game sprites
TILE_COLORS = [BLUE, VIOLET, PINK, MINT, AMBER, CYAN, CORAL, BLUE]

def tiles_sheet():
    sheet = Image.new('RGBA', (144, 18), (0, 0, 0, 0))
    for i, c in enumerate(TILE_COLORS):
        sheet.paste(finish(glass_tile(18, 18, c, radius=4), 18, 18), (i * 18, 0))
    return sheet

def tetris():
    save(tiles_sheet(), '01 Tetris/images/tiles.png')
    save(night_bg(320, 480, 3, grid=18), '01 Tetris/images/background.png')
    im = canvas(320, 480)
    d = ImageDraw.Draw(im)
    # field frame (window stays transparent) and score panel
    for box, col in (((26, 29, 210, 393), CYAN), ((214, 22, 306, 86), VIOLET)):
        rrect(d, box, 6, outline=col + (255,), width=2)
    im = glow(im, 3, 1.4)
    d = ImageDraw.Draw(im)
    rrect(d, (214, 22, 306, 86), 6, fill=(26, 11, 46, 235))
    rrect(d, (214, 22, 306, 86), 6, outline=VIOLET + (255,), width=2)
    # darken everything outside the window so the board reads clearly
    mask = Image.new('L', im.size, 255)
    ImageDraw.Draw(mask).rounded_rectangle([28 * SS, 31 * SS, 208 * SS - 1, 391 * SS - 1], radius=2 * SS, fill=0)
    shade = Image.new('RGBA', im.size, (13, 5, 24, 0))
    shade.putalpha(mask.point(lambda v: 0))
    save(finish(im, 320, 480), '01 Tetris/images/frame.png')

def xonix():
    save(tiles_sheet(), '09 Xonix/images/tiles.png')
    # enemy: spiky neon mine (the game spins it)
    im = canvas(40, 40)
    pts = poly_pts(20, 20, 19, 8, rot=math.pi / 8, inner=9)
    g = glow(Image.new('RGBA', im.size, (0, 0, 0, 0)), 1)
    body = vgrad(40 * SS, 40 * SS, lighten(PINK, .4), darken(PINK, .45))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).polygon([(x * SS, y * SS) for x, y in pts], fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.line([(x * SS, y * SS) for x, y in pts + [pts[0]]], fill=INK + (255,), width=int(1.6 * SS))
    d.ellipse([11 * SS, 11 * SS, 29 * SS, 29 * SS], fill=(26, 11, 46, 255), outline=CYAN + (255,), width=int(1.6 * SS))
    d.ellipse([16 * SS, 16 * SS, 24 * SS, 24 * SS], fill=CYAN + (255,))
    d.ellipse([18 * SS, 17 * SS, 21 * SS, 20 * SS], fill=(255, 255, 255, 230))
    save(glow(finish(im, 40, 40).resize((40 * SS, 40 * SS), Image.LANCZOS), 1.4, 1.2).resize((40, 40), Image.LANCZOS), '09 Xonix/images/enemy.png')
    # game over banner
    w, h = 500, 200
    im = canvas(w, h)
    d = ImageDraw.Draw(im)
    rrect(d, (10, 40, 490, 160), 18, fill=(13, 5, 24, 230), outline=PINK + (255,), width=3)
    im = glow(im, 5, 1.2)
    big = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    dd = ImageDraw.Draw(big)
    f = font(78)
    txt = 'GAME OVER'
    tw = dd.textlength(txt, font=f)
    dd.text(((w - tw) / 2, 52), txt, font=f, fill=(255, 255, 255, 255))
    sm = finish(im, w, h)
    sm = Image.alpha_composite(sm, glow(big.resize((w * SS, h * SS)), 3, 1.6).resize((w, h), Image.LANCZOS))
    save(sm, '09 Xonix/images/gameover.png')

def snake():
    # body segment: mint rounded gem
    im = glass_tile(16, 16, MINT, radius=5, margin=1)
    save(finish(im, 16, 16), '04 Snake/images/green.png')
    # food: pink diamond
    im = canvas(16, 16)
    pts = [(8, 1), (15, 8), (8, 15), (1, 8)]
    body = vgrad(16 * SS, 16 * SS, lighten(PINK, .5), darken(PINK, .35))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).polygon([(x * SS, y * SS) for x, y in pts], fill=255)
    im.paste(body, (0, 0), mask)
    ImageDraw.Draw(im).line([(x * SS, y * SS) for x, y in pts + [pts[0]]], fill=INK + (255,), width=int(1.3 * SS))
    ImageDraw.Draw(im).polygon([(8 * SS, 3 * SS), (11 * SS, 8 * SS), (8 * SS, 8 * SS)], fill=(255, 255, 255, 110))
    save(finish(glow(im, 1.2, 1.1), 16, 16), '04 Snake/images/red.png')
    # empty cell: dark violet with faint rim
    im = Image.new('RGBA', (16, 16), (21, 9, 40, 255))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 15, 15], outline=(44, 18, 80, 255))
    d.point((1, 1), fill=(79, 34, 141, 255))
    save(im, '04 Snake/images/white.png')

def bejeweled():
    cols = [PINK, CYAN, AMBER, MINT, VIOLET, CORAL, BLUE]
    shapes = [
        [(24.5 + 20 * math.cos(a * math.pi / 12), 24.5 + 20 * math.sin(a * math.pi / 12)) for a in range(24)],  # orb
        poly_pts(24.5, 24.5, 21, 6, rot=math.pi / 6),                                  # hexagon
        [(24.5, 3), (45, 24.5), (24.5, 46), (4, 24.5)],                                   # diamond
        [(24.5, 4), (46, 42), (3, 42)],                                                   # triangle
        poly_pts(24.5, 25.5, 22, 5, rot=-math.pi / 2, inner=10),                          # star
        [(7, 7), (42, 7), (42, 42), (7, 42)],                                             # square
        poly_pts(24.5, 24.5, 21, 8, rot=math.pi / 8),                                     # octagon
    ]
    sheet = Image.new('RGBA', (343, 49), (0, 0, 0, 0))
    for i, (pts, c) in enumerate(zip(shapes, cols)):
        g = finish(glow(shape_gem(49, pts, c), 1.6, 1.1), 49, 49)
        sheet.paste(g, (i * 49, 0), g)
    save(sheet, '10 Bejeweled/images/gems.png')
    # cursor: neon brackets
    im = canvas(48, 52)
    d = ImageDraw.Draw(im)
    L = 14
    for (x, y, dx, dy) in ((2, 2, 1, 1), (46, 2, -1, 1), (2, 50, 1, -1), (46, 50, -1, -1)):
        d.line([(x * SS, (y + dy * L) * SS), (x * SS, y * SS), ((x + dx * L) * SS, y * SS)], fill=(255, 255, 255, 255), width=int(3 * SS), joint='curve')
    cur = finish(glow(im, 2, 1.8), 48, 52)
    save(cur, '10 Bejeweled/images/cursor.png')
    save(night_bg(740, 480, 5, grid=49), '10 Bejeweled/images/background.png')

def fifteen():
    f = font(34)
    im = canvas(256, 256)
    d = ImageDraw.Draw(im)
    for i in range(16):
        x, y = (i % 4) * 64, (i // 4) * 64
        if i == 15:
            rrect(d, (x + 4, y + 4, x + 60, y + 60), 8, fill=(20, 8, 38, 255))
            continue
        t = glass_tile(56, 56, VIOLET if (i + i // 4) % 2 == 0 else (130, 70, 210), radius=9)
        im.paste(t, ((x + 4) * SS, (y + 4) * SS), t)
    small = finish(im, 256, 256)
    d = ImageDraw.Draw(small)
    fb = font(30)
    for i in range(15):
        x, y = (i % 4) * 64, (i // 4) * 64
        txt = str(i + 1)
        tw = d.textlength(txt, font=fb)
        d.text((x + 32 - tw / 2 + 1, y + 32 - 20 + 2), txt, font=fb, fill=(13, 5, 24, 160))
        d.text((x + 32 - tw / 2, y + 32 - 20), txt, font=fb, fill=(255, 255, 255, 255))
    save(small, '06 Fifteen-Puzzle/images/15.png')

def racing():
    im = canvas(43, 45)
    d = ImageDraw.Draw(im)
    for (x0, y0) in ((2, 8), (33, 8), (2, 30), (33, 30)):
        rrect(d, (x0, y0, x0 + 8, y0 + 8), 2, fill=(13, 5, 24, 255), outline=VIOLET + (255,), width=1)
    body = vgrad(43 * SS, 45 * SS, lighten(PINK, .35), darken(PINK, .4))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([8 * SS, 2 * SS, 35 * SS, 43 * SS], radius=12 * SS, fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    rrect(d, (8, 2, 35, 43), 12, outline=INK + (255,), width=1)
    rrect(d, (12, 12, 31, 24), 4, fill=(26, 11, 46, 255), outline=CYAN + (255,), width=1)   # windscreen
    rrect(d, (14, 28, 29, 38), 3, fill=darken(PINK, .45) + (255,))                         # rear deck
    d.rectangle([20 * SS, 3 * SS, 23 * SS, 11 * SS], fill=(255, 255, 255, 200))            # stripe
    for x in (12, 27):
        d.ellipse([x * SS, 3 * SS, (x + 4) * SS, 7 * SS], fill=AMBER + (255,))             # headlights
    save(finish(glow(im, 1, 1.0), 43, 45), '07 Racing (Top Down)/images/car.png')

def doodle():
    im = canvas(80, 80)
    d = ImageDraw.Draw(im)
    for x in (22, 34, 46, 58):
        rrect(d, (x, 62, x + 6, 77), 3, fill=darken(MINT, .35) + (255,), outline=INK + (255,), width=1)
    d.line([(40 * SS, 12 * SS), (40 * SS, 2 * SS)], fill=INK + (255,), width=int(2.4 * SS))
    d.ellipse([35 * SS, 0 * SS, 45 * SS, 9 * SS], fill=PINK + (255,), outline=INK + (255,), width=int(1.4 * SS))
    body = vgrad(80 * SS, 80 * SS, lighten(MINT, .45), darken(MINT, .4))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).ellipse([12 * SS, 10 * SS, 70 * SS, 72 * SS], fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.ellipse([12 * SS, 10 * SS, 70 * SS, 72 * SS], outline=INK + (255,), width=int(2 * SS))
    for cx in (28, 50):  # eyes look left
        d.ellipse([(cx - 9) * SS, 26 * SS, (cx + 7) * SS, 46 * SS], fill=(255, 255, 255, 255), outline=INK + (255,), width=int(1.6 * SS))
        d.ellipse([(cx - 7) * SS, 32 * SS, (cx + 1) * SS, 42 * SS], fill=INK + (255,))
    d.arc([22 * SS, 46 * SS, 52 * SS, 64 * SS], 20, 160, fill=INK + (255,), width=int(2 * SS))
    save(finish(im, 80, 80), '02 Doodle Jump/images/doodle.png')
    im = canvas(68, 14)
    body = vgrad(68 * SS, 14 * SS, lighten(CYAN, .35), darken(VIOLET, .15))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([1 * SS, 1 * SS, 67 * SS, 13 * SS], radius=6 * SS, fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    rrect(d, (1, 1, 67, 13), 6, outline=INK + (255,), width=1)
    rrect(d, (6, 2.5, 62, 5.5), 2, fill=(255, 255, 255, 110))
    save(finish(glow(im, 1, 1.0), 68, 14), '02 Doodle Jump/images/platform.png')
    save(night_bg(400, 533, 7, grid=40, stars=90), '02 Doodle Jump/images/background.png')

def arkanoid():
    cols = [CYAN, MINT, AMBER, PINK, VIOLET]
    for i, c in enumerate(cols, 1):
        save(finish(glass_tile(42, 20, c, radius=5), 42, 20), f'03 Arkanoid/images/block0{i}.png')
    im = canvas(12, 12)
    d = ImageDraw.Draw(im)
    d.ellipse([1 * SS, 1 * SS, 11 * SS, 11 * SS], fill=(255, 255, 255, 255), outline=CYAN + (255,), width=int(1.4 * SS))
    d.ellipse([3 * SS, 2.5 * SS, 6 * SS, 5.5 * SS], fill=(255, 255, 255, 255))
    save(finish(glow(im, 1.2, 1.4), 12, 12), '03 Arkanoid/images/ball.png')
    im = canvas(90, 9)
    body = vgrad(90 * SS, 9 * SS, lighten(CYAN, .5), darken(VIOLET, .1))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 90 * SS - 1, 9 * SS - 1], radius=4.5 * SS, fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    rrect(d, (0.5, 0.5, 89.5, 8.5), 4, outline=INK + (255,), width=1)
    rrect(d, (8, 1.5, 82, 3.5), 1, fill=(255, 255, 255, 120))
    save(finish(im, 90, 9), '03 Arkanoid/images/paddle.png')
    bg = night_bg(720, 450, 9, grid=30).convert('RGB')
    bg.save(os.path.join(G, '03 Arkanoid/images/background.jpg'), quality=92)

def asteroids():
    rnd = random.Random(21)
    def rock_sheet(r, seed):
        rnd = random.Random(seed)
        base = [rnd.uniform(.72, 1.0) for _ in range(9)]
        sheet = Image.new('RGBA', (1024, 64), (0, 0, 0, 0))
        for f in range(16):
            im = canvas(64, 64)
            d = ImageDraw.Draw(im)
            ang0 = f * (math.pi * 2 / 9) / 16 * 1.0
            pts = [(32 + r * base[i] * math.cos(ang0 + i * math.pi * 2 / 9), 32 + r * base[i] * math.sin(ang0 + i * math.pi * 2 / 9)) for i in range(9)]
            body = vgrad(64 * SS, 64 * SS, lighten(VIOLET, .25), darken(VIOLET, .6))
            mask = Image.new('L', im.size, 0)
            ImageDraw.Draw(mask).polygon([(x * SS, y * SS) for x, y in pts], fill=255)
            im.paste(body, (0, 0), mask)
            d = ImageDraw.Draw(im)
            cx, cy = 32 * SS, 32 * SS
            for i, p in enumerate(pts):  # facets, lit from the upper left
                q = pts[(i + 1) % 9]
                shade = .5 + .5 * math.cos((i * math.pi * 2 / 9 + ang0) - math.pi * 1.25)
                col = tuple(int(a * shade + b * (1 - shade)) for a, b in zip(lighten(CYAN, .1), darken(VIOLET, .55))) + (140,)
                d.polygon([(p[0] * SS, p[1] * SS), (q[0] * SS, q[1] * SS), (cx, cy)], fill=col)
            d.line([(x * SS, y * SS) for x, y in pts + [pts[0]]], fill=lighten(CYAN, .3) + (255,), width=int(1.4 * SS))
            sheet.paste(finish(glow(im, 1.2, 1.0), 64, 64), (f * 64, 0))
        return sheet
    save(rock_sheet(27, 5), '16 Asteroids/images/rock.png')
    save(rock_sheet(13, 8), '16 Asteroids/images/rock_small.png')
    bg = night_bg(1920, 1200, 11, glows=((0.2, 0.2, 520, VIOLET), (0.8, 0.75, 600, PINK), (0.55, 0.4, 420, BLUE)), stars=700).convert('RGB')
    bg.save(os.path.join(G, '16 Asteroids/images/background.jpg'), quality=90)

# ------------------------------------------------------------------ run
for fn in (tetris, xonix, snake, bejeweled, fifteen, racing, doodle, arkanoid, asteroids):
    fn(); print('redrew', fn.__name__)

REDRAWN = {'01 Tetris', '09 Xonix', '04 Snake', '10 Bejeweled', '06 Fifteen-Puzzle'}
SKIP = {  # files already redrawn above
    '01 Tetris/images/tiles.png', '01 Tetris/images/frame.png', '01 Tetris/images/background.png',
    '09 Xonix/images/tiles.png', '09 Xonix/images/enemy.png', '09 Xonix/images/gameover.png',
    '04 Snake/images/green.png', '04 Snake/images/red.png', '04 Snake/images/white.png',
    '10 Bejeweled/images/gems.png', '10 Bejeweled/images/cursor.png', '10 Bejeweled/images/background.png',
    '06 Fifteen-Puzzle/images/15.png', '07 Racing (Top Down)/images/car.png',
    '02 Doodle Jump/images/doodle.png', '02 Doodle Jump/images/platform.png', '02 Doodle Jump/images/background.png',
    '03 Arkanoid/images/ball.png', '03 Arkanoid/images/paddle.png', '03 Arkanoid/images/background.jpg',
    '16 Asteroids/images/rock.png', '16 Asteroids/images/rock_small.png', '16 Asteroids/images/background.jpg',
}
for i in range(1, 6):
    SKIP.add(f'03 Arkanoid/images/block0{i}.png')

n = 0
for d in sorted(os.listdir(G)):
    base = os.path.join(G, d)
    if not os.path.isdir(base):
        continue
    for dp, _, fs in os.walk(base):
        for f in fs:
            rel = os.path.relpath(os.path.join(dp, f), G).replace(chr(92), '/')
            if rel in SKIP or not f.lower().endswith(('.png', '.jpg', '.jpeg')):
                continue
            recolor_file(os.path.join(dp, f), STYLIZE.get(rel)); n += 1
print('re-coloured', n, 'other images')
open(MARK, 'w').write('done')
