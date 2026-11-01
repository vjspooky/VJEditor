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
  const rootHtml = fs.readFileSync('index.html', 'utf-8');
  const updatedRootHtml = rootHtml
    .replace(/href="\.\/assets\/index-[^"]+\.css"/, `href="${cssMatch[1]}"`)
    .replace(/import\('\.\/assets\/index-[^']+\.js'\)/, `import('${jsMatch[1]}')`);
  fs.writeFileSync('index.html', updatedRootHtml);
}

console.log('GitHub Pages sync complete: root, assets, docs, and 404.html synced.');
