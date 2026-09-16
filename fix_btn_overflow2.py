import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

# Change Dark mode theme
dark_vars = '''
  --bg-color: #1e1b4b;
  --card-bg: #312e81;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-blue: #38bdf8;
  --btn-green: #34d399;
  --btn-orange: #fbbf24;
  --btn-purple: #a78bfa;
  --border-radius: 32px;
  --input-bg: #1e1b4b;
  --input-border: #6366f1;
  --title-color: #38bdf8;
'''
start_var = css.find(":root {")
end_var = css.find("}", start_var)
css = css[:start_var] + ":root {" + dark_vars + css[end_var:]

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
