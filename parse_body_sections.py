import re

with open("srs.txt", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.read().splitlines()

# Parse TOC (lines 140 to 236, which is index 139 to 235)
toc_entries = []
for idx in range(139, 236):
    line = lines[idx].strip()
    match = re.match(r"^(2\.1\.\d+(?:\.\d+)*)\s+(.*?)(?:\s+\d+)?$", line)
    if match:
        num = match.group(1)
        title = match.group(2).strip()
        toc_entries.append({"num": num, "title": title})

print(f"Parsed {len(toc_entries)} TOC entries.")

# Scan body (from line 254 to line 4075) for each entry
body_text = "\n".join(lines[253:4075])
body_lines = lines[253:4075]

found_positions = []
for entry in toc_entries:
    num = entry["num"]
    title = entry["title"]
    
    # Try different search strategies:
    # 1. Exact "num\ttitle" or "num title"
    # 2. Exact "title" line
    num_esc = re.escape(num)
    title_esc = re.escape(title)
    
    pattern1 = re.compile(rf"^(?:{num_esc}\s+)?{title_esc}\s*$", re.MULTILINE | re.IGNORECASE)
    matches = list(pattern1.finditer(body_text))
    
    if matches:
        # Save character position
        found_positions.append((entry, matches[0].start()))
    else:
        # Try looser matching: title contains the name
        pattern2 = re.compile(rf"^{title_esc}\s*$", re.MULTILINE | re.IGNORECASE)
        matches2 = list(pattern2.finditer(body_text))
        if matches2:
            found_positions.append((entry, matches2[0].start()))
        else:
            print(f"Not found: {num} - {title}")

print(f"Successfully matched {len(found_positions)} / {len(toc_entries)} entries.")
