import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()
css = css.replace("2px dashed", "4px dashed")
codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
