import codecs
import re

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

# Fix the typo at the bottom
css = css.replace(r"\nbody.light-mode", "\nbody.light-mode")

# Let's completely nuke the left-panel and right-panel backgrounds to ensure they are the gradient
css = css.replace("background: transparent !important;", "background: rgba(26, 11, 46, 0.5) !important; backdrop-filter: blur(10px) !important;")

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
