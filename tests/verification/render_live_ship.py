import os
import subprocess

html_content = """<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
body { margin: 0; background: #07192F; display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; }
svg { width: 1000px; height: 1100px; }
</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="390 40 1260 1410">
  <g class="veliero-sails" fill="#FAF7F2">
    <path d="ALL_SAILS_PATH" />
  </g>
  <g class="veliero-structure" fill="#DDA15E">
    <path d="ENGRAVING_PATH" />
  </g>
</svg>
</body>
</html>
"""

with open('frontend/src/app/shared/components/svg-icons/veliero-ship-paths.ts', 'r', encoding='utf-8') as f:
    ts = f.read()

import re
m_eng = re.search(r'export const VELIERO_ENGRAVING_PATH\s*=\s*\'([^\']+)\';', ts)
eng = m_eng.group(1).strip()
m_all = re.search(r'export const VELIERO_ALL_SAILS_PATH\s*=\s*\'([^\']+)\';', ts)
sails = m_all.group(1).strip()

html_content = html_content.replace('ALL_SAILS_PATH', sails).replace('ENGRAVING_PATH', eng)

html_path = os.path.abspath('tests/verification/live_ship_render.html')
png_path = os.path.abspath('tests/verification/live_ship_render.png')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1200,1300",
    f"--screenshot={png_path}",
    f"file:///{html_path.replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print(f"Rendered {png_path}")
