import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()
old = "font-family: 'Nunito', sans-serif;"
new = "font-family: 'Nunito', sans-serif !important;"
css = css.replace(old, new)
codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
