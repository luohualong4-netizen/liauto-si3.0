from PIL import Image

img = Image.open('assets/facade.jpg')
W, H = img.size

# Scan at x=25% (left side of building, away from logo) - should show the building top clearly
print('Left side scan (x=25%):')
cx = int(W * 0.25)
prev = None
for y in range(400, 1200, 2):
    r, g, b = img.getpixel((cx, y))[:3]
    bright = (r+g+b)//3
    changed = prev is not None and abs(bright - prev) > 12
    if changed or (bright > 190):
        tag = ' *** JUMP' if changed else (' [BRIGHT]' if bright > 190 else '')
        print(f'  y={y:4d} ({y/H*100:.1f}%)  bright={bright:3d}{tag}')
    prev = bright

print()
print('Right side scan (x=75%):')
cx2 = int(W * 0.75)
prev = None
for y in range(400, 1100, 2):
    r, g, b = img.getpixel((cx2, y))[:3]
    bright = (r+g+b)//3
    changed = prev is not None and abs(bright - prev) > 12
    if changed or (bright > 190):
        tag = ' *** JUMP' if changed else (' [BRIGHT]' if bright > 190 else '')
        print(f'  y={y:4d} ({y/H*100:.1f}%)  bright={bright:3d}{tag}')
    prev = bright
