import sys
sys.path.insert(0, '.')
import re
import os
import subprocess

with open('frontend/src/app/shared/components/svg-icons/veliero-ship-paths.ts', 'r', encoding='utf-8') as f:
    text = f.read()

from tests.verification.verify_vector import split_into_subpaths, parse_svg_path, compute_path_bounds, approximate_polygon_area

m_eng = re.search(r'export const VELIERO_ENGRAVING_PATH\s*=\s*\'([^\']+)\';', text)
eng = m_eng.group(1).strip()

m_jibs = re.search(r'jibs:\s*\'([^\']+)\'', text)
jibs = m_jibs.group(1).strip()
subpaths = split_into_subpaths(jibs)

html_parts = [
    '<!DOCTYPE html><html><head><meta charset="utf-8">',
    '<style>body { background: #222; font-family: sans-serif; color: white; margin: 20px; }',
    '.card { display: inline-block; margin: 10px; border: 1px solid #444; padding: 10px; text-align: center; }',
    'svg { width: 350px; height: 300px; background: #07192F; }',
    '</style></head><body>'
]

for idx in [6, 7, 8]:
    sp = subpaths[idx]
    b = compute_path_bounds(parse_svg_path(sp))
    area = approximate_polygon_area(sp)
    html_parts.append(f'<div class="card">')
    html_parts.append(f'<h3>Subpath {idx} (Area: {area:,.0f} px²)</h3>')
    html_parts.append(f'<p>Bounds: X=[{b[0]:.0f}, {b[2]:.0f}] Y=[{b[1]:.0f}, {b[3]:.0f}]</p>')
    html_parts.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="1200 950 450 400">')
    html_parts.append(f'  <path d="{sp}" fill="#00FFCC" opacity="0.8" />')
    html_parts.append(f'  <path d="{eng}" fill="#FAF7F2" opacity="0.4" />')
    html_parts.append('</svg>')
    html_parts.append('</div>')

html_parts.append('</body></html>')

html_path = os.path.abspath('tests/verification/jibs_678.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(html_parts))

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
png_path = os.path.abspath('tests/verification/jibs_678.png')
cmd = [
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1200,500",
    f"--screenshot={png_path}",
    f"file:///{html_path.replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print(f"Rendered {png_path}")
