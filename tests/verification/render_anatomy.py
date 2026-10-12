import sys
sys.path.insert(0, '.')
import re
import os
import subprocess

with open('frontend/src/app/shared/components/svg-icons/veliero-ship-paths.ts', 'r', encoding='utf-8') as f:
    text = f.read()

m_eng = re.search(r'export const VELIERO_ENGRAVING_PATH\s*=\s*\'([^\']+)\';', text)
eng = m_eng.group(1).strip()

groups = ['mainsail', 'foremast', 'mizzen', 'jibs', 'pennants', 'sternFlag']
group_colors = {
    'mainsail': '#2ECC71',  # emerald green
    'foremast': '#3498DB',  # blue
    'mizzen': '#F1C40F',    # yellow
    'jibs': '#E74C3C',      # red
    'pennants': '#9B59B6',  # purple
    'sternFlag': '#E67E22'  # orange
}

svg_parts = []
svg_parts.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="390 40 1260 1410" width="1260" height="1410" style="background:#07192F">')

# Background: rendered anatomical sail groups
for g in groups:
    m_g = re.search(rf'{g}:\s*\'([^\']+)\'', text)
    if m_g:
        p = m_g.group(1).strip()
        c = group_colors[g]
        svg_parts.append(f'  <g id="{g}" fill="{c}" opacity="0.9"><path d="{p}" /></g>')

# Foreground: copperplate engraving
svg_parts.append(f'  <g id="engraving" fill="#FFFFFF" opacity="0.45"><path d="{eng}" /></g>')
svg_parts.append('</svg>')

svg_path = 'tests/verification/full_ship_anatomy.svg'
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(svg_parts))

print(f'Wrote {svg_path}')

# Render to PNG
chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
png_path = os.path.abspath('tests/verification/full_ship_anatomy.png')
html_path = os.path.abspath('tests/verification/full_ship_anatomy.html')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(f'<!DOCTYPE html><html><body style="margin:0;background:#07192F"><img src="full_ship_anatomy.svg" width="1260" height="1410"></body></html>')

cmd = [
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1260,1410",
    f"--screenshot={png_path}",
    f"file:///{html_path.replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print(f'Rendered {png_path} ({os.path.getsize(png_path)} bytes)')
