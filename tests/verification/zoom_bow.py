import os
import re
import subprocess

with open('materiale_utile/loghi_e_vettoriali/Veliero_nero.svg', 'r', encoding='utf-8') as f:
    svg = f.read()

m = re.search(r' d="([^"]+)"', svg)
d = m.group(1)

html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
body {{ margin: 0; background: #FAF7F2; display: flex; align-items: center; justify-content: center; width: 100vw; height: 100vh; }}
svg {{ width: 1200px; height: 1000px; }}
</style>
</head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="1200 950 450 400">
  <path d="{d}" fill="#07192F" />
</svg>
</body>
</html>
"""

html_path = os.path.abspath('tests/verification/zoom_bow_original.html')
png_path = os.path.abspath('tests/verification/zoom_bow_original.png')

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--window-size=1200,1000",
    f"--screenshot={png_path}",
    f"file:///{html_path.replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print(f"Rendered {png_path}")
