from pathlib import Path
from PIL import Image

root = Path(__file__).parents[1]
source = Image.open(root / 'assets/exercises/specialized-exercises-sheet-2.png').convert('RGB')
out = root / 'apps/member-portal/src/assets/exercises/gifs'
names = ['pull-up','muscle-up','ring-dip','archer-push-up','diamond-push-up','handstand-push-up','front-lever','back-lever','dragon-flag','toes-to-bar','hanging-knee-raise','nordic-hamstring-curl','burpee','wall-ball','rowing-machine','assault-bike','front-squat','overhead-squat','clean-and-jerk','barbell-snatch','push-press','sumo-deadlift-high-pull','farmer-carry','handstand-walk']
cell_w, cell_h = source.width // 4, source.height // 6
for i, name in enumerate(names):
    x, y = (i % 4) * cell_w, (i // 4) * cell_h
    cell = source.crop((x, y, x + cell_w, y + cell_h))
    cell.save(out / f'{name}.gif', save_all=True, append_images=[cell, cell], duration=420, loop=0, optimize=True)
