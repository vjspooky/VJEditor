# build.py (with optimized JPEG compression for ultra-fast canvas loading)
import os
import re
import io
import base64
import mimetypes
import subprocess
import sys
from PIL import Image

from src_builder.styles import CSS_CONTENT
from src_builder.data import DATA_CONTENT
from src_builder.audio_engine import AUDIO_ENGINE_CONTENT
from src_builder.canvas_compositor import CANVAS_COMPOSITOR_CONTENT
from src_builder.ui_header import HEADER_CONTENT
from src_builder.ui_sidebar import SIDEBAR_CONTENT
from src_builder.ui_canvas_view import CANVAS_VIEW_CONTENT
from src_builder.ui_inspector import INSPECTOR_CONTENT
from src_builder.ui_timeline import TIMELINE_CONTENT
from src_builder.ui_modals import MODALS_CONTENT
from src_builder.app_root import APP_ROOT_CONTENT

intermediate_dir = "artifacts/file_generation/ttl=63d/intermediate"
output_dir = "artifacts/file_generation/ttl=63d/output"
os.makedirs(intermediate_dir, exist_ok=True)
os.makedirs(output_dir, exist_ok=True)

html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VJEditor — AI-Powered Professional Video Creation Studio</title>
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React 18 & ReactDOM -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <!-- Babel Standalone -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
{CSS_CONTENT}
  </style>
</head>
<body class="bg-[#0b0c10] text-slate-100 overflow-hidden">
  <div id="root"></div>

  <script type="text/babel">
{DATA_CONTENT}

{AUDIO_ENGINE_CONTENT}

{CANVAS_COMPOSITOR_CONTENT}

{HEADER_CONTENT}

{SIDEBAR_CONTENT}

{CANVAS_VIEW_CONTENT}

{INSPECTOR_CONTENT}

{TIMELINE_CONTENT}

{MODALS_CONTENT}

{APP_ROOT_CONTENT}

    // Mount to DOM
    const rootEl = document.getElementById('root');
    if (rootEl) {{
      ReactDOM.createRoot(rootEl).render(<App />);
    }}
  </script>
</body>
</html>
"""

intermediate_file = os.path.join(intermediate_dir, "vjeditor.html")
with open(intermediate_file, "w", encoding="utf-8") as f:
    f.write(html_template)
print(f"Wrote intermediate file: {intermediate_file} ({len(html_template)} bytes)")

# Inlining optimized images to output file
output_file = os.path.join(output_dir, "vjeditor.html")

b64_cache = {}
def get_optimized_b64(filepath):
  if filepath not in b64_cache:
    try:
      im = Image.open(filepath)
      im.thumbnail((1280, 720), Image.Resampling.LANCZOS)
      buf = io.BytesIO()
      im.save(buf, format='JPEG', quality=82, optimize=True)
      raw_bytes = buf.getvalue()
      b64 = base64.b64encode(raw_bytes).decode('utf-8')
      b64_cache[filepath] = f"data:image/jpeg;base64,{b64}"
    except Exception as e:
      print("Fallback standard b64:", e)
      with open(filepath, 'rb') as f:
        data = base64.b64encode(f.read()).decode('utf-8')
      b64_cache[filepath] = f"data:image/jpeg;base64,{data}"
  return b64_cache[filepath]

def inline_images_single(content):
  paths = set(re.findall(r'''user_uploaded_files/[^"'\s)]+''', content))
  res = content
  for p in paths:
    if os.path.exists(p):
      data_uri = get_optimized_b64(p)
      res = res.replace(p, data_uri)
  return res

inlined_html = inline_images_single(html_template)
with open(output_file, "w", encoding="utf-8") as f:
    f.write(inlined_html)
print(f"Wrote inlined output file: {output_file} ({len(inlined_html)} bytes)")
print("Build complete successfully!")
