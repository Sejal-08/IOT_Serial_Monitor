import re

lines = open('arduino.html', 'r', encoding='utf-8').read().split('\n')
for i, line in enumerate(lines):
    if "right-panel" in line:
        print(f"{i}: {line}")
        for j in range(i, i+15):
            print(f"  {lines[j]}")
        break
