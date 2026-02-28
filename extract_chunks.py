import os

file_path = r'C:\Users\Murilo Cruise\.gemini\antigravity\brain\2ffb469e-ed36-437c-a6ae-badfc98341c9\logo_base64.txt'
if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read().strip()
    
    print(f"TOTAL LENGTH: {len(content)}")
    
    chunk_size = 5000
    for i in range(0, len(content), chunk_size):
        start = i
        end = min(i + chunk_size, len(content))
        print(f"---START {start} TO {end}---")
        print(content[start:end])
        print(f"---END {start} TO {end}---")
else:
    print("FILE NOT FOUND")
