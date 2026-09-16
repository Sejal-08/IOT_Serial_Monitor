import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

dark_vars = '''
  --bg-color: #0d1117; /* Very dark galaxy blue */
  --card-bg: #161b22;
  --text-main: #ffffff;
  --text-muted: #8b949e;
  --primary-blue: #00e5ff; /* Arcade Neon Cyan */
  --btn-green: #39ff14; /* Neon Green */
  --btn-orange: #ffea00; /* Neon Yellow */
  --btn-purple: #ff00ff; /* Neon Magenta */
  --border-radius: 32px;
  --input-bg: #0d1117;
  --input-border: #7928ca; /* Vibrant Purple borders */
  --title-color: #00e5ff;
'''

start_var = css.find(":root {")
end_var = css.find("}", start_var)
css = css[:start_var] + ":root {\n" + dark_vars + css[end_var:]

# Make the backgrounds of the dashboard slightly cooler
css = css.replace("background-color: var(--bg-color) !important;", "background-color: var(--bg-color) !important; background-image: radial-gradient(circle at 10% 20%, rgba(121, 40, 202, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(0, 229, 255, 0.15) 0%, transparent 40%) !important;")

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
