from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
data=json.loads((ROOT/'quiz-data.json').read_text(encoding='utf-8'))
css=(ROOT/'style.css').read_text(encoding='utf-8')
scripts='\n'.join((ROOT/name).read_text(encoding='utf-8') for name in ['engine.js','app.js'])
checked=data.get('checked_date','')[:7].replace('-','年',1).lstrip('0')
checked=checked+'月' if checked else ''
html='''<!doctype html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#173f86"><meta name="description" content="公民課的建國練習：6題，看看你的選擇比較像內閣制、總統制，還是混合制。"><title>如果由你建國｜政府制度配對測驗</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap" rel="stylesheet"><style>'''+css+'''</style></head>
<body><main id="app" class="shell"></main><footer class="footer"><p>資料查核：'''+checked+'''</p></footer><noscript><p>請開啟瀏覽器的JavaScript功能，才能進行互動測驗。</p></noscript><script>const QUIZ_DATA='''+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+';\n'+scripts+'''</script></body></html>'''
(ROOT/'index.html').write_text(html,encoding='utf-8')
print("Built index.html")
