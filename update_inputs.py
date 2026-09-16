import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

input_css = '''
.input-field {
  background: var(--input-bg) !important;
  border: 3px solid var(--input-border) !important;
  border-radius: 20px !important;
  color: var(--text-main) !important;
  font-weight: 800 !important;
  padding: 10px 18px !important;
  outline: none;
  height: 48px !important;
  box-sizing: border-box;
  font-size: 15px !important;
  transition: all 0.2s;
}
.input-field:focus {
  border-color: var(--primary-blue) !important;
  box-shadow: 0 0 0 4px rgba(0, 210, 255, 0.3) !important;
}
'''
start_in = css.find(".input-field {")
end_in = css.find("}", start_in) + 1
css = css[:start_in] + input_css + css[end_in:]

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
