import codecs
import re

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

css = re.sub(
    r"body\.school-mode \{.*?\n.*?\}",
    "body.school-mode {\n  background: linear-gradient(135deg, #1A0B2E 0%, #2D1B4E 50%, #1A0B2E 100%) !important;\n  background-color: #2D1B4E !important;\n  color: var(--text-main) !important;\n  font-family: 'Nunito', sans-serif !important;\n}",
    css,
    flags=re.DOTALL
)

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
