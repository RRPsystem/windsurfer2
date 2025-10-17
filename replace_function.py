import re

# Read main.js
with open('js/main.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Read new function
with open('TEMP_loadTravelIdea.txt', 'r', encoding='utf-8') as f:
    new_func = f.read()

# Find the start of loadTravelIdea
start_marker = '    // Load Travel Compositor idea into the builder using Travel Cards\n    loadTravelIdea(data) {'
end_marker = '    setupBoltDeeplinkSave() {'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('Could not find function markers')
    print(f'start_idx: {start_idx}, end_idx: {end_idx}')
    exit(1)

# Replace the function
before = content[:start_idx]
after = content[end_idx:]

new_content = before + '    // Load Travel Compositor idea into the builder using Travel Cards\n' + new_func + '\n\n' + after

# Write back
with open('js/main.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Function replaced successfully!')
