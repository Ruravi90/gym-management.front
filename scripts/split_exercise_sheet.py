from pathlib import Path
from PIL import Image

source = Image.open(Path(__file__).parents[1] / 'assets/exercises/specialized-exercises-sheet.png').convert('RGB')
out = Path(__file__).parents[1] / 'assets/exercises/gifs'
out.mkdir(parents=True, exist_ok=True)
names = ['australian-pull-up','chin-up','pike-push-up','pistol-squat','l-sit-hold','hollow-body-hold','box-jump','kettlebell-swing','thruster','power-clean','dumbbell-snatch','double-unders']
cell_w, cell_h = source.width // 4, source.height // 3
for i, name in enumerate(names):
    x, y = (i % 4) * cell_w, (i // 4) * cell_h
    cell = source.crop((x, y, x + cell_w, y + cell_h))
    # Preserve the complete panel: both positions and the motion arrow remain visible.
    cell.save(out / f'{name}.gif', save_all=True, append_images=[cell, cell], duration=420, loop=0, optimize=True)
