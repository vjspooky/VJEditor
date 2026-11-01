import fs from 'node:fs';
import path from 'node:path';

// 1. Copy 404.html
fs.copyFileSync('dist/index.html', 'dist/404.html');
fs.copyFileSync('dist/index.html', '404.html');

// 2. Ensure .nojekyll
fs.writeFileSync('.nojekyll', '');

// 3. Sync dist/assets to ./assets
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets', { recursive: true });
}
for (const file of fs.readdirSync('dist/assets')) {
  fs.copyFileSync(path.join('dist/assets', file), path.join('assets', file));
}

// 4. Sync dist to ./docs for GitHub Pages docs-folder option
if (!fs.existsSync('docs')) {
  fs.mkdirSync('docs', { recursive: true });
}
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDir('dist', 'docs');
fs.writeFileSync('docs/.nojekyll', '');

// 5. Update root index.html bundle references
const distHtml = fs.readFileSync('dist/index.html', 'utf-8');
const jsMatch = distHtml.match(/src="(\.\/assets\/index-[^"]+\.js)"/);
const cssMatch = distHtml.match(/href="(\.\/assets\/index-[^"]+\.css)"/);

if (jsMatch && cssMatch) {
  const rootHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta
      name="description"
      content="VJEditor — AI-Powered Professional Video Creation Studio"
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>VJEditor — AI-Powered Professional Video Creation Studio</title>
    <link rel="stylesheet" crossorigin href="${cssMatch[1]}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        import('/src/main.tsx');
      } else {
        import('${jsMatch[1]}');
      }
    </script>
  </body>
</html>
`;
  fs.writeFileSync('index.html', rootHtml);
}

console.log('GitHub Pages sync complete: root, assets, docs, and 404.html synced.');
