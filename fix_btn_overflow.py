import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

# Fix button padding and font size
css = css.replace("padding: 10px 24px !important;", "padding: 10px 16px !important;")
css = css.replace("font-size: 15px !important;", "font-size: 13px !important;")

# Change Dark mode theme
dark_vars = '''
  --bg-color: #1e1b4b; /* deep indigo */
  --card-bg: #312e81;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-blue: #38bdf8; /* light sky blue */
  --btn-green: #34d399; /* soft green */
  --btn-orange: #fbbf24; /* soft amber/orange */
  --btn-purple: #a78bfa; /* soft purple */
  --border-radius: 32px;
  --input-bg: #1e1b4b;
  --input-border: #6366f1; /* soft indigo border */
  --title-color: #38bdf8;
'''
start_var = css.find(":root {\n  --bg-color: #1A1A2E;")
end_var = css.find("}", start_var)
if start_var != -1:
    css = css[:start_var] + ":root {\n" + dark_vars + css[end_var:]
else:
    print("Could not find dark vars to replace")

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
