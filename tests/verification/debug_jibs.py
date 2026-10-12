import sys
sys.path.insert(0, '.')
import re
import os
import subprocess

with open('frontend/src/app/shared/components/svg-icons/veliero-ship-paths.ts', 'r', encoding='utf-8') as f:
    text = f.read()

from tests.verification.verify_vector import split_into_subpaths, parse_svg_path, compute_path_bounds, approximate_polygon_area

m = re.search(r'jibs:\s*\'([^\']+)\'', text)
jibs_path = m.group(1).strip()
subpaths = split_into_subpaths(jibs_path)

m_eng = re.search(r'export const VELIERO_ENGRAVING_PATH\s*=\s*\'([^\']+)\';', text)
eng = m_eng.group(1).strip()

colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'magenta', 'yellow', 'lime']

svg_parts = []
svg_parts.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="1200 950 500 450" width="1000" height="900" style="background:#07192F">')
# Top layer engraving
svg_parts.append(f'<path d="{eng}" fill="#DDA15E" opacity="0.6" />')
for i, sp in enumerate(subpaths):
    c = colors[i % len(colors)]
    b = compute_path_bounds(parse_svg_path(sp))
    area = approximate_polygon_area(sp)
    svg_parts.append(f'<path d="{sp}" fill="{c}" stroke="white" stroke-width="2" opacity="0.8" />')
    y_pos = 980 + i * 35
    svg_parts.append(f'<text x="1220" y="{y_pos}" fill="{c}" font-size="20" font-family="sans-serif">Subpath {i}: Bounds Y=[{b[1]:.0f}, {b[3]:.0f}], Area={area:.0f}</text>')
svg_parts.append('</svg>')

svg_path = 'tests/verification/jibs_debug.svg'
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(svg_parts))

print(f'Wrote {svg_path}')

# Render to PNG with headless Chrome
chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
png_path = os.path.abspath('tests/verification/jibs_debug.png')
html_path = os.path.abspath('tests/verification/jibs_debug.html')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(f'<!DOCTYPE html><html><body style="margin:0;background:#07192F"><img src="jibs_debug.svg" width="1000" height="900"></body></html>')

cmd = [
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1000,900",
    f"--screenshot={png_path}",
    f"file:///{html_path.replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print(f'Rendered {png_path} ({os.path.getsize(png_path)} bytes)')
