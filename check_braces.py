import codecs
css = codecs.open('school_theme.css', 'r', 'utf-8').read()
left = css.count('{')
right = css.count('}')
print(f'Left braces: {left}, Right braces: {right}')
