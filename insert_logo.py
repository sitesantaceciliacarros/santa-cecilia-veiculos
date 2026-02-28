import os

# Paths
curr_dir = os.path.dirname(os.path.abspath(__file__))
html_path = os.path.join(curr_dir, 'index.html')

# Reconstruct Base64
full_base64 = ""
for i in range(1, 7):
    chunk_path = os.path.join(curr_dir, f'truth_chunk{i}.txt')
    with open(chunk_path, 'r', encoding='utf-8') as f:
        full_base64 += f.read().strip()

# Prepare data URI
data_uri = f"data:image/png;base64,{full_base64}"

# Read HTML and replace
with open(html_path, 'r', encoding='utf-8') as f:
    html_content = f.read()

new_html = html_content.replace("LOGO_BASE64_PLACEHOLDER", data_uri)

# Write back
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Insertion complete!")
