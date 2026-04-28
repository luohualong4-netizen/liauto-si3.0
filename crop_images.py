from PIL import Image
import os

img38 = Image.open('assets/overview/elements-p38.jpg')
W2, H2 = img38.size

S = 1.842
OX, OY = 1023, 490

def d2orig(dx0, dy0, dx1, dy1):
    x0 = int(dx0 * S) + OX
    y0 = int(dy0 * S) + OY
    x1 = int(dx1 * S) + OX
    y1 = int(dy1 * S) + OY
    return (x0, y0, x1, y1)

# Find 透明玻璃 end
y_scan = int(150 * S) + OY
for x_pct in range(87, 100):
    x = int(W2 * x_pct / 100)
    r, g, b = img38.getpixel((x, y_scan))[:3]
    brightness = (r+g+b)/3
    disp_x = (x - OX) / S
    if brightness < 230:
        print(f'  x={x_pct}%  disp_x={disp_x:.0f}  brightness={brightness:.0f}')

# Swatch image area (y in displayed-probe coords)
sw_y0, sw_y1 = 65, 248

# ── Precise card boundaries from transition scan (displayed-probe x coords) ──
# 标识 cards (logo/text illustrations)
biao_cards = [
    ('biaoshi-swatch-1', 190, 385),    # 一级标识 — logo outline
    ('biaoshi-swatch-2', 390, 590),    # 二级标识 — 理想 综合中心
    ('biaoshi-swatch-3', 595, 878),    # 三级标识 — 零售/交付/服务
]

# 门楣 cards (material photos, from transition scan)
heng_cards = [
    ('hengmei-swatch-1',  933, 1142),  # 波浪板 (corrugated)
    ('hengmei-swatch-2', 1178, 1386),  # 铝塑板/铝单板 (gray panel)
    ('hengmei-swatch-3', 1420, 1628),  # 洗墙灯 (wash light)
]

# 幕墙 cards (material photos)
mu_cards = [
    ('muqiang-swatch-1', 1664, 1872),  # 铝塑板/铝单板 (gray)
    ('muqiang-swatch-2', 1908, 2100),  # 透明玻璃 (glass)
]

os.makedirs('assets/overview', exist_ok=True)
all_cards = biao_cards + heng_cards + mu_cards

for name, dx0, dx1 in all_cards:
    box = d2orig(dx0, sw_y0, dx1, sw_y1)
    crop = img38.crop(box)
    out = f'assets/overview/{name}.jpg'
    crop.save(out, 'JPEG', quality=92)
    print(f'  {out}  size={crop.size}')

print('\nDone.')
