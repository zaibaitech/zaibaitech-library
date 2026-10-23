"""
Snapshot the text layer of the Three Books PDF (run once, locally; needs pdfplumber).

    python3 scripts/extract-three-books.py "<path to Three Books - Complete English Translation [Final]_PRINT.pdf>"

Writes content/sources/three-books/pages.json: every line of every page, in reading order, with its
position, size and runs of bold/italic text, and every ruled table cell by cell. Nothing is corrected or
re-worded here; scripts/build-three-books.mjs turns this snapshot into the books.
The PDF itself is not committed. Its SHA-256 is recorded so the snapshot can be traced to it.
"""
import hashlib, json, sys
import pdfplumber

SRC = sys.argv[1]
OUT = "content/sources/three-books/pages.json"


def style(fontname):
    name = fontname.split("+")[-1]
    bold = "Bol" in name or "Bold" in name
    italic = "Italic" in name
    return ("b" if bold else "") + ("i" if italic else "")


def runs(words):
    """Merge words into runs of one style. Words are joined by a space only where the page leaves a gap:
    pdfplumber also splits a word where the font changes (an italic title and the comma after it)."""
    out = []
    prev = None
    for w in words:
        s = style(w["fontname"])
        gap = prev is not None and w["x0"] - prev["x1"] > 1.0
        text = (" " if gap else "") + w["text"]
        if out and out[-1][1] == s:
            out[-1][0] += text
        elif out and gap and s and not out[-1][1]:
            # keep the joining space in the plain run, outside the styled one
            out[-1][0] += " "
            out.append([w["text"], s])
        else:
            out.append([text, s])
        prev = w
    return out


def lines_of(words):
    rows = []
    for w in words:
        if rows and abs(rows[-1]["top"] - w["top"]) < 2.5:
            rows[-1]["words"].append(w)
        else:
            rows.append({"top": w["top"], "words": [w]})
    out = []
    for r in rows:
        ws = sorted(r["words"], key=lambda w: w["x0"])
        sizes = [round(w["size"], 1) for w in ws]
        out.append({
            "top": round(r["top"], 1),
            "x0": round(ws[0]["x0"], 1),
            "x1": round(ws[-1]["x1"], 1),
            "size": max(set(sizes), key=sizes.count),
            "runs": runs(ws),
        })
    return out


pages = []
with pdfplumber.open(SRC) as pdf:
    for number, page in enumerate(pdf.pages, start=1):
        words = page.extract_words(extra_attrs=["fontname", "size"], x_tolerance=1.5, use_text_flow=True)
        tables = []
        for t in page.find_tables():
            x0, top, x1, bottom = t.bbox
            inside = lambda e: x0 - 2 <= e["x0"] <= x1 + 2 and top - 2 <= e["top"] <= bottom + 2

            def rules(values):
                out = []
                for v in sorted(values):
                    if not out or v - out[-1] > 2:
                        out.append(v)
                return out

            # Cells are the spaces between the table's own ruling lines.
            xs = rules(e["x0"] for e in page.edges if e["orientation"] == "v" and inside(e))
            ys = rules(e["top"] for e in page.edges if e["orientation"] == "h" and inside(e))
            cols = [(a, b) for a, b in zip(xs, xs[1:]) if b - a > 12]
            bands = [(a, b) for a, b in zip(ys, ys[1:]) if b - a > 6]
            rows = []
            for a, b in bands:
                in_band = [w for w in words if a <= (w["top"] + w["bottom"]) / 2 <= b]
                cells = []
                for c0, c1 in cols:
                    cell = [w for w in in_band if c0 <= (w["x0"] + w["x1"]) / 2 <= c1]
                    cells.append(" ".join("".join(r[0] for r in line["runs"]) for line in lines_of(cell)))
                if any(cells):
                    rows.append(cells)
            tables.append({"top": round(top, 1), "bottom": round(bottom, 1), "rows": rows})
        in_table = lambda w: any(t["top"] - 1 <= w["top"] <= t["bottom"] + 1 for t in tables)
        body = [w for w in words if not in_table(w)]
        lines = lines_of(body)
        # The printed page number is the small centred line at the foot of the page.
        printed = None
        for line in lines:
            if line["size"] < 10 and line["top"] > 530:
                printed = "".join(r[0] for r in line["runs"])
                lines.remove(line)
                break
        pages.append({"pdfPage": number, "printed": printed, "lines": lines, "tables": tables})

digest = hashlib.sha256(open(SRC, "rb").read()).hexdigest()
json.dump({
    "source": {
        "file": "Three Books - Complete English Translation [Final]_PRINT.pdf",
        "sha256": digest,
        "pages": len(pages),
        "extractedWith": f"pdfplumber {pdfplumber.__version__}",
    },
    "pages": pages,
}, open(OUT, "w"), ensure_ascii=False, indent=1)
print(f"{len(pages)} pages -> {OUT}")
