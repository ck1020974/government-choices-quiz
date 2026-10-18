from pathlib import Path
import json
ROOT=Path(__file__).resolve().parent
data=json.loads((ROOT/'quiz-data.json').read_text(encoding='utf-8'))
css=(ROOT/'style.css').read_text(encoding='utf-8')
scripts='\n'.join((ROOT/name).read_text(encoding='utf-8') for name in ['engine.js','app.js'])
html='''<!doctype html>
<html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#173f86"><meta name="description" content="高中公民的建國練習：9道制度選擇，探索你與12個國家的政府制度配對。大字閱讀，手機也能輕鬆作答。"><title>如果由你建國｜政府制度配對測驗</title><style>'''+css+'''</style></head>
<body><main id="app" class="shell"></main><footer class="footer"><p>資料查核：2026年10月</p></footer><noscript><p>請開啟瀏覽器的JavaScript功能，才能進行互動測驗。</p></noscript><script>const QUIZ_DATA='''+json.dumps(data,ensure_ascii=False).replace('</','<\\/')+';\n'+scripts+'''</script></body></html>'''
(ROOT/'index.html').write_text(html,encoding='utf-8')
print("Built index.html")
