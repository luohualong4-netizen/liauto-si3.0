from PIL import Image

img38 = Image.open('assets/overview/elements-p38.jpg')
W2, H2 = img38.size

S = 1.842
OX, OY = 1023, 490

# Find exact vertical dividers by scanning a horizontal row inside the swatch area
# Dividers appear as near-white vertical gaps between cards
# y=700 in displayed-probe = y_probe=1289, y_original=1289+490=1779... no wait

# y in swatch area: displayed y=150 → probe_y = 150*1.842 = 276 → orig_y = 276+490 = 766
y_scan = int(150 * S) + OY   # = 766 in original

print(f'Scanning x at orig_y={y_scan} to find card dividers (white gaps):')
# Track brightness transitions
prev_bright = None
transitions = []
for x_pct_10 in range(190, 900):  # x=19% to 90% of W2
    x = int(W2 * x_pct_10 / 1000)
    r, g, b = img38.getpixel((x, y_scan))[:3]
    brightness = (r + g + b) / 3
    disp_x = (x - OX) / S  # convert back to displayed-probe coord
    if prev_bright is not None:
        # Transition from dark→light (end of card) or light→dark (start of card)
        if prev_bright < 230 and brightness >= 245:
            transitions.append(('end-card', disp_x, brightness))
        elif prev_bright >= 245 and brightness < 230:
            transitions.append(('start-card', disp_x, brightness))
    prev_bright = brightness

for t in transitions:
    print(f'  {t[0]:12s}  disp_x={t[1]:.0f}  brightness={t[2]:.0f}')
