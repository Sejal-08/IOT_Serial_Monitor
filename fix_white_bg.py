import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

# Fix the messy body.school-mode
old_body = '''body.school-mode {
  background-color: var(--bg-color) !important; background: linear-gradient(135deg, #1A0B2E 0%, #2D1B4E 50%, #1A0B2E 100%) !important;
  color: var(--text-main) !important;
  font-family: 'Nunito', sans-serif !important;
  background-image: var(--bg-gradient) !important;
}'''

new_body = '''body.school-mode {
  background: linear-gradient(135deg, #1A0B2E 0%, #2D1B4E 50%, #1A0B2E 100%) !important;
  background-color: #2D1B4E !important;
  color: var(--text-main) !important;
  font-family: 'Nunito', sans-serif !important;
}'''

css = css.replace(old_body, new_body)

# Just in case, let's also remove background-image: none from cyber-grid-main and set it explicitly to transparent
old_grid = '''/* Remove the grid background from the right panel */
.cyber-grid-main {
    background-image: none !important;
    background-color: transparent !important;
}'''
new_grid = '''/* Remove the grid background from the right panel */
.cyber-grid-main {
    background-image: none !important;
    background-color: transparent !important;
}
body {
    background: linear-gradient(135deg, #1A0B2E 0%, #2D1B4E 50%, #1A0B2E 100%) !important;
    background-color: #2D1B4E !important;
}'''
css = css.replace(old_grid, new_grid)

# Also fix Light mode overriding this
light_body = '''body.light-mode {
    background: #FFF2CC !important;
    background-color: #FFF2CC !important;
}'''
css += "\\n" + light_body

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
