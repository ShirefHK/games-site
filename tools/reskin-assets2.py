"""Round 2 sprite redraws: Chess, Minesweeper, Pipe Puzzle, Volleyball.
Needs round 1 first (shares its helpers). Run ONCE:  python tools/reskin-assets2.py   (--force to repeat)"""
import os, sys, math
here = os.path.dirname(os.path.abspath(__file__))
MARK2 = os.path.join(here, '.assets2-done')
if os.path.exists(MARK2) and '--force' not in sys.argv:
    print('already applied (delete tools/.assets2-done or use --force)'); sys.exit(0)
src = open(os.path.join(here, 'reskin-assets.py'), encoding='utf8').read()
head = src.split('# ------------------------------------------------------------------ run')[0]
sys.argv.append('--force')           # helpers' own "already done" guard must not stop us
exec(compile(head, 'reskin-assets.py', 'exec'), globals())

def sym_font(size):
    for f in ('seguisym.ttf', 'seguiemj.ttf', 'arial.ttf'):
        try:
            return ImageFont.truetype('C:/Windows/Fonts/' + f, size)
        except Exception:
            pass
    return ImageFont.load_default()

def chess():
    # sheet: 6 columns x 2 rows of 56x56 cells: rook, knight, bishop, queen, king, pawn
    glyphs = ['\u265C', '\u265E', '\u265D', '\u265B', '\u265A', '\u265F']
    sheet = Image.new('RGBA', (340, 120), (0, 0, 0, 0))
    f = sym_font(46 * SS)
    for row, col in enumerate((PINK, CYAN)):
        for i, g in enumerate(glyphs):
            im = Image.new('RGBA', (56 * SS, 56 * SS), (0, 0, 0, 0))
            d = ImageDraw.Draw(im)
            bb = d.textbbox((0, 0), g, font=f)
            x = (56 * SS - (bb[2] - bb[0])) / 2 - bb[0]
            y = (56 * SS - (bb[3] - bb[1])) / 2 - bb[1] + 1 * SS
            # outline then fill, so every piece reads on both square colours
            for dx in range(-3, 4):
                for dy in range(-3, 4):
                    if dx * dx + dy * dy <= 9:
                        d.text((x + dx, y + dy), g, font=f, fill=INK + (255,))
            d.text((x, y), g, font=f, fill=lighten(col, .1) + (255,))
            body = Image.new('RGBA', im.size, (0, 0, 0, 0))
            grad = vgrad(56 * SS, 56 * SS, lighten(col, .55), darken(col, .25))
            mask = Image.new('L', im.size, 0)
            ImageDraw.Draw(mask).text((x, y), g, font=f, fill=255)
            body.paste(grad, (0, 0), mask)
            im = Image.alpha_composite(im, body)
            cell = finish(glow(im, 1.2, 1.0), 56, 56)
            sheet.paste(cell, (i * 56, row * 56), cell)
    save(sheet, '14 Chess/images/figures.png')

def mine_sprite(size):
    im = canvas(size, size)
    c = size / 2
    pts = poly_pts(c, c, size * .42, 8, rot=math.pi / 8, inner=size * .2)
    body = vgrad(size * SS, size * SS, lighten(PINK, .4), darken(PINK, .45))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).polygon([(x * SS, y * SS) for x, y in pts], fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.line([(x * SS, y * SS) for x, y in pts + [pts[0]]], fill=INK + (255,), width=int(1.2 * SS))
    r = size * .13
    d.ellipse([(c - r) * SS, (c - r) * SS, (c + r) * SS, (c + r) * SS], fill=CYAN + (255,))
    return im

def minesweeper():
    NUM = {1: CYAN, 2: MINT, 3: PINK, 4: VIOLET, 5: AMBER, 6: (45, 212, 191), 7: (255, 255, 255), 8: (154, 147, 184)}
    sheet = Image.new('RGBA', (384, 32), (0, 0, 0, 255))
    fb = font(24)
    def revealed():
        t = Image.new('RGBA', (32, 32), (26, 11, 46, 255))
        d = ImageDraw.Draw(t); d.rectangle([0, 0, 31, 31], outline=(44, 18, 80, 255))
        return t
    def hidden():
        return finish(glass_tile(32, 32, (110, 66, 190), radius=5, margin=1), 32, 32)
    for i in range(12):
        if i == 10:
            t = hidden()
        elif i == 11:
            t = hidden()
            f_ = canvas(32, 32); d = ImageDraw.Draw(f_)
            d.line([(13 * SS, 7 * SS), (13 * SS, 25 * SS)], fill=(255, 255, 255, 255), width=int(2 * SS))
            d.polygon([(13 * SS, 7 * SS), (25 * SS, 12 * SS), (13 * SS, 17 * SS)], fill=PINK + (255,), outline=INK + (255,))
            d.rectangle([9 * SS, 25 * SS, 20 * SS, 27 * SS], fill=(255, 255, 255, 255))
            t = Image.alpha_composite(t, finish(f_, 32, 32))
        elif i == 9:
            t = Image.alpha_composite(revealed(), finish(mine_sprite(28), 28, 28).crop((0, 0, 28, 28)).resize((28, 28)) if False else Image.new('RGBA', (32, 32), (0, 0, 0, 0)))
            m = finish(mine_sprite(28), 28, 28)
            t.paste(m, (2, 2), m)
        else:
            t = revealed()
            if i >= 1:
                d = ImageDraw.Draw(t)
                s = str(i); w = d.textlength(s, font=fb)
                col = NUM[i]
                d.text((16 - w / 2 + 1, 3), s, font=fb, fill=INK + (200,))
                d.text((16 - w / 2, 2), s, font=fb, fill=col + (255,))
        sheet.paste(t, (i * 32, 0))
    sheet.convert('RGB').save(os.path.join(G, '05 Minesweeper/images/tiles.jpg'), quality=95)

def neon_from_mask(path, top, bottom, rad=1.4, boost=1.2):
    im = Image.open(path).convert('RGBA')
    a = im.split()[3]
    grad = vgrad(im.width, im.height, top, bottom)
    out = Image.new('RGBA', im.size, (0, 0, 0, 0))
    out.paste(grad, (0, 0), a)
    big = out.resize((im.width * SS, im.height * SS), Image.LANCZOS)
    return finish(glow(big, rad, boost), im.width, im.height)

def netwalk():
    base = '11 NetWalk (Pipe Puzzle)/images/'
    out = neon_from_mask(os.path.join(G, base + 'pipes.png'), (170, 245, 255), (110, 120, 255))
    # brighter core line so thin pipes still read
    save(out, base + 'pipes.png')
    # computers: off (dark) and on (glowing) 37x36 frames at x=0 and x=52
    comp = Image.new('RGBA', (89, 36), (0, 0, 0, 0))
    for x, on in ((0, False), (52, True)):
        im = canvas(37, 36); d = ImageDraw.Draw(im)
        rrect(d, (2, 2, 35, 25), 4, fill=(26, 11, 46, 255) if not on else (20, 70, 90, 255), outline=(VIOLET if not on else CYAN) + (255,), width=2)
        d.rectangle([16 * SS, 25 * SS, 21 * SS, 30 * SS], fill=VIOLET + (255,))
        rrect(d, (10, 30, 27, 34), 2, fill=VIOLET + (255,))
        if on:
            rrect(d, (6, 6, 31, 21), 2, fill=CYAN + (110,))
        g = finish(glow(im, 1.4, 1.2) if on else im, 37, 36)
        comp.paste(g, (x, 0), g)
    save(comp, base + 'comp.png')
    im = canvas(40, 40); d = ImageDraw.Draw(im)
    for y in (4, 15, 26):
        rrect(d, (5, y, 35, y + 9), 3, fill=(26, 11, 46, 255), outline=MINT + (255,), width=2)
        d.ellipse([9 * SS, (y + 3) * SS, 13 * SS, (y + 7) * SS], fill=MINT + (255,))
        d.rectangle([20 * SS, (y + 3) * SS, 31 * SS, (y + 4.5) * SS], fill=MINT + (170,))
    save(finish(glow(im, 1.4, 1.2), 40, 40), base + 'server.png')

def volleyball():
    base = '15 Volleyball/images/'
    im = canvas(64, 64)
    body = vgrad(64 * SS, 64 * SS, (250, 247, 255), (150, 130, 205))
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).ellipse([3 * SS, 3 * SS, 61 * SS, 61 * SS], fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    for box, a0, a1 in (([-14, 6, 50, 70], 300, 60), ([14, 6, 78, 70], 120, 240), ([-8, -34, 72, 34], 20, 160)):
        d.arc([v * SS for v in box], a0, a1, fill=VIOLET + (255,), width=int(2.4 * SS))
    d.ellipse([3 * SS, 3 * SS, 61 * SS, 61 * SS], outline=INK + (255,), width=int(1.8 * SS))
    d.ellipse([14 * SS, 10 * SS, 26 * SS, 20 * SS], fill=(255, 255, 255, 170))
    save(finish(glow(im, 1.6, 1.0), 64, 64), base + 'ball.png')
    # blob character: neutral, softly shaded so the game's tint still colours it
    im = canvas(75, 89); d = ImageDraw.Draw(im)
    body = vgrad(75 * SS, 89 * SS, (255, 255, 255), (150, 150, 165))
    mask = Image.new('L', im.size, 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([8 * SS, 2 * SS, 68 * SS, 52 * SS], fill=255)
    md.rounded_rectangle([4 * SS, 34 * SS, 72 * SS, 87 * SS], radius=30 * SS, fill=255)
    im.paste(body, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.ellipse([22 * SS, 14 * SS, 38 * SS, 36 * SS], fill=(255, 255, 255, 255), outline=(40, 30, 60, 255), width=int(1.6 * SS))
    d.ellipse([27 * SS, 22 * SS, 36 * SS, 33 * SS], fill=(30, 20, 50, 255))
    d.ellipse([12 * SS, 50 * SS, 26 * SS, 62 * SS], fill=(255, 255, 255, 150))
    save(finish(im, 75, 89), base + 'blobby.png')

for fn in (chess, minesweeper, netwalk, volleyball):
    fn(); print('redrew', fn.__name__)
open(MARK2, 'w').write('done')
