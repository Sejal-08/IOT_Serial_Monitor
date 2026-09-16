import codecs

css = codecs.open('school_theme.css', 'r', 'utf-8').read()

# Make borders thicker and cards rounder
css = css.replace("--border-radius: 20px;", "--border-radius: 32px;")
css = css.replace("border-radius: 25px !important;", "border-radius: 32px !important; border: 3px solid var(--input-border) !important;")

# Make buttons pill-shaped and bouncy
btn_css = '''
.action-btn {
  border: none !important;
  border-radius: 50px !important;
  font-weight: 900 !important;
  color: white !important;
  padding: 10px 24px !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  gap: 8px !important;
  cursor: pointer !important;
  font-size: 15px !important;
  height: 48px !important;
  box-sizing: border-box;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
}
.action-btn:hover {
  transform: scale(1.08) translateY(-2px);
}
.action-btn:active {
  transform: scale(0.95);
}
'''
css = css.replace(".action-btn {\n  border: none !important;", btn_css.split(".action-btn {")[1].replace("  transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;\n}", ""))

# Inject btn_css properly
start = css.find(".action-btn {")
end = css.find("}", start) + 1
css = css[:start] + btn_css + css[end:]

# Override variables for Dark Mode to make it a "Fun Space Theme"
dark_vars = '''
  --bg-color: #1A1A2E;
  --card-bg: #16213E;
  --text-main: #FFFFFF;
  --text-muted: #A3A3C2;
  --primary-blue: #00D2FF;
  --btn-green: #00E676;
  --btn-orange: #FF9A44;
  --btn-purple: #9D4EDD;
  --border-radius: 32px;
  --input-bg: #0F3460;
  --input-border: #E94560;
  --title-color: #00D2FF;
'''
start_var = css.find(":root {")
end_var = css.find("}", start_var)
css = css[:start_var] + ":root {\n" + dark_vars + css[end_var:]

# Override Light Mode to make it "Sunny Day Theme"
light_vars = '''
  --bg-color: #FFF2CC;
  --card-bg: #FFFFFF;
  --text-main: #333333;
  --text-muted: #888888;
  --primary-blue: #3B82F6;
  --btn-green: #4ADE80;
  --btn-orange: #F59E0B;
  --btn-purple: #C084FC;
  --input-bg: #F3F4F6;
  --input-border: #FCD34D;
  --title-color: #F59E0B;
'''
start_light = css.find("body.light-mode {")
end_light = css.find("}", start_light)
css = css[:start_light] + "body.light-mode {\n" + light_vars + css[end_light:]

# Add some fun card hover effects
card_css = '''
.sensor-card, .sensor-cards > div {
  background: var(--card-bg) !important;
  border-radius: 32px !important;
  box-shadow: 0 8px 0 var(--input-border), 0 15px 20px rgba(0,0,0,0.1) !important;
  border: 3px solid var(--input-border) !important;
  padding: 24px !important;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55) !important;
}
.sensor-card:hover, .sensor-cards > div:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 0 var(--input-border), 0 20px 25px rgba(0,0,0,0.15) !important;
}
'''
start_card = css.find(".sensor-card, .sensor-cards > div {")
end_card = css.find("}", start_card) + 1
css = css[:start_card] + card_css + css[end_card:]

# Update left panel cards
school_card = '''
.school-card {
  background: var(--card-bg) !important;
  border-radius: var(--border-radius) !important;
  padding: 24px !important;
  box-shadow: 0 6px 0 var(--input-border) !important;
  border: 3px solid var(--input-border) !important;
  margin-bottom: 24px !important;
}
'''
start_sc = css.find(".school-card {")
end_sc = css.find("}", start_sc) + 1
css = css[:start_sc] + school_card + css[end_sc:]

codecs.open('school_theme.css', 'w', 'utf-8').write(css)
print('Done!')
