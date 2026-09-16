import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()
css = css.replace("background: rgba(26, 11, 46, 0.5) !important; backdrop-filter: blur(10px) !important;", "background: var(--bg-color) !important;")
codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
