import fs from 'node:fs';
import path from 'node:path';

// 1. Copy 404.html
fs.copyFileSync('dist/index.html', 'dist/404.html');
fs.copyFileSync('dist/index.html', '404.html');

// 2. Ensure .nojekyll
fs.writeFileSync('.nojekyll', '');

// 3. Clean and sync dist/assets to ./assets
if (fs.existsSync('assets')) {
  for (const file of fs.readdirSync('assets')) {
    fs.unlinkSync(path.join('assets', file));
  }
} else {
  fs.mkdirSync('assets', { recursive: true });
}
for (const file of fs.readdirSync('dist/assets')) {
  fs.copyFileSync(path.join('dist/assets', file), path.join('assets', file));
}

// 4. Clean and sync dist to ./docs
if (fs.existsSync('docs')) {
  fs.rmSync('docs', { recursive: true, force: true });
}
fs.mkdirSync('docs', { recursive: true });

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

console.log('GitHub Pages sync complete: dist, assets, docs, and 404.html cleanly synced.');
