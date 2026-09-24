"""Create WebP copies without changing dimensions (sprite coordinates stay valid)."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
mapping = {}
before = after = 0
for source in sorted((root / 'public/images').rglob('*.png')):
    target = source.with_suffix('.webp')
    if target.exists():
        continue
    with Image.open(source) as image:
        image.save(target, 'WEBP', quality=84, method=6)
    if target.stat().st_size >= source.stat().st_size:
        target.unlink()
        continue
    mapping['/' + str(source.relative_to(root / 'public'))] = '/' + str(target.relative_to(root / 'public'))
    before += source.stat().st_size
    after += target.stat().st_size
for file in (root / 'src').rglob('*'):
    if file.suffix not in {'.tsx', '.ts', '.js', '.css'}:
        continue
    original = file.read_text()
    updated = original
    for old, new in mapping.items():
        updated = updated.replace(old, new)
    # Station cards use a dynamic URL; all six variants are converted above.
    updated = updated.replace('/images/stations/${stop.id}.png', '/images/stations/${stop.id}.webp')
    if updated != original:
        file.write_text(updated)
print(json.dumps({'images':len(mapping),'beforeBytes':before,'afterBytes':after}))
