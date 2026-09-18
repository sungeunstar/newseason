from pathlib import Path

import pymupdf
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT.parents[1] / "output" / "pdf" / "전성은_서비스프로덕트기획_포트폴리오_2026.pdf"
RENDER_DIR = ROOT / "tmp" / "pdfs" / "final-render"
CONTACT = ROOT / "_audit" / "portfolio-pdf-contact-final.png"

RENDER_DIR.mkdir(parents=True, exist_ok=True)
doc = pymupdf.open(PDF)
if len(doc) != 31:
    raise RuntimeError(f"Expected 31 pages, got {len(doc)}")

page_paths = []
for index, page in enumerate(doc):
    pixmap = page.get_pixmap(matrix=pymupdf.Matrix(4 / 3, 4 / 3), alpha=False)
    target = RENDER_DIR / f"p{index + 1:02}.png"
    pixmap.save(target)
    page_paths.append(target)

cols, rows = 4, 8
thumb_w, thumb_h = 352, 198
label_h, gap, pad, header_h = 30, 18, 32, 78
cell_h = thumb_h + label_h
sheet_w = pad * 2 + cols * thumb_w + (cols - 1) * gap
sheet_h = header_h + pad + rows * cell_h + (rows - 1) * gap + pad
sheet = Image.new("RGB", (sheet_w, sheet_h), "#080a0e")
draw = ImageDraw.Draw(sheet)
font = ImageFont.load_default(size=14)
title_font = ImageFont.load_default(size=28)
draw.text((pad, 24), "Portfolio PDF QA - 31 Pages", fill="#f1f3f7", font=title_font)

for index, source in enumerate(page_paths):
    col, row = index % cols, index // cols
    x = pad + col * (thumb_w + gap)
    y = header_h + pad + row * (cell_h + gap)
    with Image.open(source) as rendered:
        thumb = rendered.convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
    sheet.paste(thumb, (x, y))
    draw.text((x + 2, y + thumb_h + 6), f"{index + 1:02}", fill="#7892ff", font=font)

sheet.save(CONTACT, optimize=True)
print(f"PDF QA rendered: {len(page_paths)} pages -> {CONTACT}")
