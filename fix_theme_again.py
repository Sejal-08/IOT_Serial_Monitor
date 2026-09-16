import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

dark_vars = '''
  --bg-color: #0f172a;
  --card-bg: #1e293b;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --primary-blue: #3b82f6;
  --btn-green: #10b981;
  --btn-orange: #f59e0b;
  --btn-purple: #8b5cf6;
  --border-radius: 32px;
  --input-bg: #0f172a;
  --input-border: #334155;
  --title-color: #f1f5f9;
'''

start_var = css.find(":root {")
end_var = css.find("}", start_var)
css = css[:start_var] + ":root {\n" + dark_vars + css[end_var:]

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
