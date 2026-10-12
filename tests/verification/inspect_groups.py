import sys
sys.path.insert(0, '.')
import re
import os
import subprocess

with open('frontend/src/app/shared/components/svg-icons/veliero-ship-paths.ts', 'r', encoding='utf-8') as f:
    text = f.read()

from tests.verification.verify_vector import split_into_subpaths, parse_svg_path, compute_path_bounds, approximate_polygon_area

groups = ['mainsail', 'foremast', 'mizzen', 'pennants', 'sternFlag']

m_eng = re.search(r'export const VELIERO_ENGRAVING_PATH\s*=\s*\'([^\']+)\';', text)
eng = m_eng.group(1).strip()

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

for g in groups:
    m_g = re.search(rf'{g}:\s*\'([^\']+)\'', text)
    g_path = m_g.group(1).strip()
    subpaths = split_into_subpaths(g_path)
    
    # Check bounds of each subpath
    print(f"\n--- GROUP '{g}' ({len(subpaths)} subpaths) ---")
    deepest_sp = None
    max_y = 0
    large_subpaths = []
    for idx, sp in enumerate(subpaths):
        b = compute_path_bounds(parse_svg_path(sp))
        area = approximate_polygon_area(sp)
        if b[3] > max_y:
            max_y = b[3]
            deepest_sp = (idx, b, area)
        if area > 1000:
            large_subpaths.append((idx, b, area))
            
    print(f"Deepest subpath in '{g}': idx={deepest_sp[0]}, Bounds X=[{deepest_sp[1][0]:.1f}, {deepest_sp[1][2]:.1f}] Y=[{deepest_sp[1][1]:.1f}, {deepest_sp[1][3]:.1f}], Area={deepest_sp[2]:.1f}")
    print(f"Large subpaths (area > 1000) count: {len(large_subpaths)}")
    for idx, b, area in large_subpaths:
        print(f"  sp #{idx:2d}: Area={area:8,.0f} px^2, Bounds X=[{b[0]:.1f}, {b[2]:.1f}] Y=[{b[1]:.1f}, {b[3]:.1f}]")

    # Render group preview
    html = f"""<!DOCTYPE html><html><body style="background:#07192F;margin:0;display:flex;align-items:center;justify-content:center;height:100vh;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="390 40 1260 1410" width="1000" height="1100">
      <path d="{g_path}" fill="#00FFCC" opacity="0.85" />
      <path d="{eng}" fill="#DDA15E" opacity="0.45" />
    </svg>
    </body></html>"""
    
    html_path = os.path.abspath(f'tests/verification/group_{g}.html')
    png_path = os.path.abspath(f'tests/verification/group_{g}.png')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
        
    cmd = [
        chrome,
        "--headless=new",
        "--disable-gpu",
        "--window-size=1000,1100",
        f"--screenshot={png_path}",
        f"file:///{html_path.replace(os.sep, '/')}"
    ]
    subprocess.run(cmd, check=True)
    print(f"Rendered {png_path}")
