import sys
sys.path.insert(0, '.')
import re
from tests.verification.verify_vector import split_into_subpaths, parse_svg_path, compute_path_bounds, approximate_polygon_area

with open('materiale_utile/loghi_e_vettoriali/Veliero_nero.svg', 'r', encoding='utf-8') as f:
    svg = f.read()

m = re.search(r' d="([^"]+)"', svg)
d = m.group(1)

subpaths = split_into_subpaths(d)
print(f'Total subpaths in Veliero_nero.svg: {len(subpaths)}')

# Let's find all subpaths with area > 500
large_cavities = []
for idx, sp in enumerate(subpaths):
    area = approximate_polygon_area(sp)
    if area > 500:
        b = compute_path_bounds(parse_svg_path(sp))
        large_cavities.append((idx, area, b, sp))

print(f'Total subpaths with area > 500: {len(large_cavities)}')
large_cavities.sort(key=lambda x: x[1], reverse=True)
for idx, area, b, sp in large_cavities[:40]:
    print(f'Cavity #{idx:4d}: Area={area:10,.0f} px^2, Bounds X=[{b[0]:6.1f}, {b[2]:6.1f}] Y=[{b[1]:6.1f}, {b[3]:6.1f}]')
