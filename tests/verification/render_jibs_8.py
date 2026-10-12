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

sp = subpaths[8]
b = compute_path_bounds(parse_svg_path(sp))
area = approximate_polygon_area(sp)

html = f"""<!DOCTYPE html><html><body style="background:#07192F;margin:0;display:flex;align-items:center;justify-content:center;height:100vh;">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="1200 950 450 400" width="800" height="700">
  <path d="{sp}" fill="#00FFCC" opacity="0.8" />
  <path d="{eng}" fill="#DDA15E" opacity="0.5" />
</svg>
</body></html>"""

html_path = os.path.abspath('tests/verification/jibs_8.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
png_path = os.path.abspath('tests/verification/jibs_8.png')
cmd = [
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--window-size=800,700",
    f"--screenshot={png_path}",
    f"file:///{html_path.replace(os.sep, '/')}"
]
subprocess.run(cmd, check=True)
print(f"Rendered {png_path}")
