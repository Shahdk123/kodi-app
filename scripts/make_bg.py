# Draws the Nubian-village-on-the-Nile background (896x1344, same size as the old reef.jpg)
import math, random, io
import cairosvg
from PIL import Image

random.seed(7)
W, H = 896, 1344
o = []
add = o.append

add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
add('''<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#1e1245"/><stop offset="0.35" stop-color="#6b21a8"/>
  <stop offset="0.6" stop-color="#e2562b"/><stop offset="0.8" stop-color="#fb923c"/><stop offset="1" stop-color="#fde68a"/>
</linearGradient>
<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
  <stop offset="0" stop-color="#fff7c2" stop-opacity="0.95"/><stop offset="0.35" stop-color="#fde047" stop-opacity="0.55"/>
  <stop offset="1" stop-color="#fb923c" stop-opacity="0"/>
</radialGradient>
<linearGradient id="nile" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f59e6b"/><stop offset="0.25" stop-color="#2a8f9c"/><stop offset="1" stop-color="#0b3b5c"/>
</linearGradient>
<linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f2b866"/><stop offset="1" stop-color="#b9702f"/>
</linearGradient>
</defs>''')

# sky + stars + sun
add(f'<rect width="{W}" height="{H}" fill="url(#sky)"/>')
for _ in range(45):
    x, y = random.uniform(0, W), random.uniform(0, 420)
    add(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{random.uniform(0.8,2.1):.1f}" fill="#fff" opacity="{random.uniform(0.35,0.9):.2f}"/>')
add('<circle cx="448" cy="765" r="300" fill="url(#glow)"/>')
add('<circle cx="448" cy="765" r="105" fill="#fff3b0"/>')

# far dunes
add(f'<path d="M0 790 Q120 735 260 775 T520 770 T760 760 T{W} 775 L{W} 820 L0 820Z" fill="#7a3b2e" opacity="0.9"/>')
add(f'<path d="M0 805 Q180 770 330 800 T640 795 T{W} 800 L{W} 830 L0 830Z" fill="#9a4a32"/>')

# tiny far-bank village
def tiny(x, w, h, c):
    add(f'<rect x="{x}" y="{812-h}" width="{w}" height="{h}" fill="{c}"/>')
    add(f'<path d="M{x+w*0.3} 812 v-{h*0.4} a{w*0.2} {w*0.2} 0 0 1 {w*0.4} 0 v{h*0.4}Z" fill="#3b1a10"/>')
for x, w, h, c in [(70,38,30,'#2dd4bf'),(112,30,24,'#f9a8d4'),(150,44,34,'#fde68a'),(640,40,28,'#38bdf8'),
                   (686,34,36,'#f9a8d4'),(726,46,26,'#2dd4bf'),(780,32,32,'#fde68a')]:
    tiny(x, w, h, c)

# river
add(f'<rect y="812" width="{W}" height="200" fill="url(#nile)"/>')
for i in range(16):
    y = 822 + i * 11
    w = 340 - i * 14 + random.uniform(-25, 25)
    add(f'<rect x="{448-w/2:.0f}" y="{y}" width="{max(w,40):.0f}" height="3" rx="1.5" fill="#fff3b0" opacity="{0.75 - i*0.04:.2f}"/>')
for _ in range(26):
    x, y = random.uniform(0, W), random.uniform(840, 1000)
    add(f'<rect x="{x:.0f}" y="{y:.0f}" width="{random.uniform(18,60):.0f}" height="2" rx="1" fill="#bdf3ee" opacity="0.28"/>')

# felucca silhouette
def felucca(cx, cy, s):
    add(f'<g transform="translate({cx} {cy}) scale({s})" fill="#2a1208">'
        '<path d="M-60 0 Q0 22 66 -2 L56 12 Q0 26 -50 12Z"/>'
        '<path d="M-2 -6 L-4 -110 L58 -14Z" fill="#fff7ed"/><path d="M-6 -6 L-6 -118 L-9 -118 L-9 -6Z"/></g>')
felucca(250, 905, 0.9)
felucca(690, 950, 0.65)

# near sand bank
add(f'<path d="M0 1005 Q220 960 430 1000 T{W} 985 L{W} {H} L0 {H}Z" fill="url(#sand)"/>')
add(f'<path d="M0 1050 Q260 1010 520 1055 T{W} 1040 L{W} {H} L0 {H}Z" fill="#d4934a" opacity="0.7"/>')

# palms
def palm(x, base, h, lean):
    tx, ty = x + lean, base - h
    add(f'<path d="M{x-9} {base} Q{x+lean*0.2} {base-h*0.55} {tx-4} {ty} L{tx+4} {ty} Q{x+lean*0.2+16} {base-h*0.55} {x+9} {base}Z" fill="#5a3418"/>')
    for k in range(0, int(h), 26):
        yy = base - k
        add(f'<path d="M{x-8+lean*k/h:.0f} {yy} h16" stroke="#3f2410" stroke-width="3" opacity="0.6"/>')
    for a in (-175, -150, -122, -95, -68, -40, -12, 15):
        r = math.radians(a)
        L = 120 if abs(a + 95) > 40 else 96
        ex, ey = tx + L * math.cos(r), ty + L * math.sin(r) * 0.55 + 34
        mx, my = tx + L * 0.55 * math.cos(r), ty + L * 0.55 * math.sin(r) - 30
        add(f'<path d="M{tx} {ty} Q{mx:.0f} {my:.0f} {ex:.0f} {ey:.0f}" stroke="#2f7d32" stroke-width="9" fill="none" stroke-linecap="round"/>')
        add(f'<path d="M{tx} {ty} Q{mx:.0f} {my:.0f} {ex:.0f} {ey:.0f}" stroke="#74c365" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.7"/>')
    for dx in (-10, 4, 16):
        add(f'<circle cx="{tx+dx}" cy="{ty+12}" r="7" fill="#b45309"/>')
palm(168, 1250, 330, -22)
palm(742, 1250, 380, 26)

# Nubian houses
def house(x, w, h, body, trim, accent, top='flat', base=1270):
    y = base - h
    if top == 'dome':
        add(f'<path d="M{x+w*0.14} {y} A{w*0.36} {w*0.36} 0 0 1 {x+w*0.86} {y}Z" fill="{body}"/>')
        add(f'<path d="M{x+w*0.14} {y} A{w*0.36} {w*0.36} 0 0 1 {x+w*0.86} {y}" stroke="{trim}" stroke-width="5" fill="none"/>')
        add(f'<rect x="{x+w/2-4}" y="{y-w*0.36-22}" width="8" height="22" fill="{trim}"/>')
    elif top == 'vault':
        add(f'<path d="M{x} {y} Q{x+w/2} {y-w*0.42} {x+w} {y}Z" fill="{body}"/>')
        add(f'<path d="M{x} {y} Q{x+w/2} {y-w*0.42} {x+w} {y}" stroke="{trim}" stroke-width="5" fill="none"/>')
    else:
        for i in range(4):
            add(f'<rect x="{x+6+i*(w-12)/4+4}" y="{y-14}" width="{(w-12)/4-8:.0f}" height="14" fill="{body}"/>')
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{body}"/>')
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="none" stroke="{trim}" stroke-width="4"/>')
    # painted zigzag + triangles band
    pts = ' '.join(f'{x+8+i*(w-16)/10:.0f},{y+22+(10 if i%2 else 0)}' for i in range(11))
    add(f'<polyline points="{pts}" fill="none" stroke="{accent}" stroke-width="5" stroke-linejoin="round"/>')
    n = max(5, int(w // 26))
    for i in range(n):
        tx = x + 8 + i * (w - 16) / n
        tw = (w - 16) / n
        add(f'<path d="M{tx:.0f} {y+44} l{tw/2:.0f} 14 l{tw/2:.0f} -14Z" fill="{trim}"/>')
    # big arched door
    dw, dh = w * 0.24, h * 0.5
    cx = x + w / 2
    add(f'<path d="M{cx-dw/2-7} {base} V{base-dh+dw/2} A{dw/2+7} {dw/2+7} 0 0 1 {cx+dw/2+7} {base-dh+dw/2} V{base}Z" fill="{trim}"/>')
    add(f'<path d="M{cx-dw/2} {base} V{base-dh+dw/2} A{dw/2} {dw/2} 0 0 1 {cx+dw/2} {base-dh+dw/2} V{base}Z" fill="#2a1208"/>')
    add(f'<circle cx="{cx+dw*0.28:.0f}" cy="{base-dh*0.38:.0f}" r="3" fill="#fbbf24"/>')
    # windows
    for fx in (0.17, 0.83):
        wx, wy = x + w * fx, y + h * 0.42
        add(f'<path d="M{wx-12:.0f} {wy+34:.0f} v-26 a12 12 0 0 1 24 0 v26Z" fill="#2a1208" stroke="{trim}" stroke-width="4"/>')
    # painted flowers/dots
    for i in range(5):
        add(f'<circle cx="{x+14+i*(w-28)/4:.0f}" cy="{base-10}" r="4" fill="{accent}"/>')

house(14, 210, 200, '#14b8a6', '#fff7ed', '#fbbf24', 'flat')
house(236, 170, 160, '#f472b6', '#fff7ed', '#7c2d12', 'dome')
house(424, 236, 220, '#fbbf24', '#7c2d12', '#0f766e', 'vault')
house(676, 206, 178, '#f8fafc', '#2563eb', '#ef4444', 'flat')

# ground + Nubian pattern band at the bottom
add(f'<rect y="1270" width="{W}" height="{H-1270}" fill="#3b1a0c"/>')
n = 28
sw = W / n
for i in range(n):
    c1, c2 = ('#fbbf24', '#14b8a6') if i % 2 == 0 else ('#ef4444', '#f8fafc')
    add(f'<path d="M{i*sw:.0f} {H-34} l{sw/2:.0f} -40 l{sw/2:.0f} 40Z" fill="{c1}"/>')
    add(f'<path d="M{i*sw:.0f} {H} l{sw/2:.0f} -34 l{sw/2:.0f} 34Z" fill="{c2}"/>')
add(f'<rect y="1262" width="{W}" height="8" fill="#fbbf24"/>')
add('</svg>')

png = cairosvg.svg2png(bytestring='\n'.join(o).encode(), output_width=W, output_height=H)
img = Image.open(io.BytesIO(png)).convert('RGB')
img.save('assets/nubia.jpg', quality=88, optimize=True, progressive=True)
img.save('/tmp/nubia-preview.png')
print('ok', img.size)
