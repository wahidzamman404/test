"""Build the portable, single-file demo using only Python's standard library."""

import base64
import mimetypes
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def embed_assets(text):
    for asset in sorted((ROOT / "assets").rglob("*")):
        if asset.suffix not in {".jpg", ".png", ".svg", ".woff2"}:
            continue
        reference = asset.relative_to(ROOT).as_posix()
        if reference not in text:
            continue
        mime = mimetypes.guess_type(asset.name)[0] or "application/octet-stream"
        encoded = base64.b64encode(asset.read_bytes()).decode("ascii")
        text = text.replace(reference, f"data:{mime};base64,{encoded}")
    return text


def main():
    html = (ROOT / "index.html").read_text()
    css = embed_assets((ROOT / "styles.css").read_text())
    javascript = embed_assets((ROOT / "app.js").read_text())
    html = html.replace('<link rel="stylesheet" href="styles.css">', f"<style>\n{css}\n</style>")
    html = html.replace('<script src="app.js" defer></script>', "")
    html = html.replace("</body>", f"<script>\n{javascript}\n</script>\n</body>")
    html = embed_assets(html)
    output = ROOT / "dist" / "shahbaz-furniture-demo.html"
    output.parent.mkdir(exist_ok=True)
    output.write_text(html)
    print(f"Built {output.relative_to(ROOT)} ({output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
