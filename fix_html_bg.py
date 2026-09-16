import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()
css += "\nhtml { background-color: #1A0B2E !important; min-height: 100vh; }"
codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
