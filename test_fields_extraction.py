import re

with open("srs.txt", "r", encoding="utf-8", errors="ignore") as f:
    lines = f.read().splitlines()

# Parse TOC
toc_entries = []
for idx in range(139, 236):
    line = lines[idx].strip()
    match = re.match(r"^(2\.1\.\d+(?:\.\d+)*)\s+(.*?)(?:\s+\d+)?$", line)
    if match:
        num = match.group(1)
        title = match.group(2).strip()
        toc_entries.append({"num": num, "title": title})

# Slice body text
body_text = "\n".join(lines[253:4075])

# Find match positions
positions = []
for entry in toc_entries:
    num = entry["num"]
    title = entry["title"]
    
    num_esc = re.escape(num)
    title_esc = re.escape(title)
    
    pattern = re.compile(rf"^(?:{num_esc}\s+)?{title_esc}\s*$", re.MULTILINE | re.IGNORECASE)
    matches = list(pattern.finditer(body_text))
    if matches:
        positions.append((entry, matches[0].start()))
    else:
        pattern2 = re.compile(rf"^{title_esc}\s*$", re.MULTILINE | re.IGNORECASE)
        matches2 = list(pattern2.finditer(body_text))
        if matches2:
            positions.append((entry, matches2[0].start()))

positions.sort(key=lambda x: x[1])

# Test parsing for index 0 (Sign In) and index 5 (Create Goods - wait, let's find Create Goods)
for i, (entry, pos) in enumerate(positions):
    if entry["num"] in ["2.1.1", "2.1.3.2"]:
        start = pos
        end = positions[i+1][1] if i + 1 < len(positions) else len(body_text)
        slice_text = body_text[start:end]
        
        # Parse fields
        slice_lines = slice_text.splitlines()
        print(f"\n=== {entry['num']} - {entry['title']} ===")
        print("Slice length:", len(slice_lines))
        # Print first 10 lines
        for j in range(min(15, len(slice_lines))):
            print(f"  {j}: {repr(slice_lines[j])}")
