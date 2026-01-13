import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import hljs from 'highlight.js';
import { glob } from 'glob';
import liquidsoap from '../src/languages/liquidsoap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

hljs.registerLanguage('liquidsoap', liquidsoap);

const LIQUIDSOAP_DIR = path.join(__dirname, 'liquidsoap');
const OUTPUT_DIR = path.join(__dirname, 'html-output');
const PATTERNS = [
  'src/**/*.liq',
  'tests/**/*.liq'
];

const HTML_TEMPLATE = (title, code) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <style>
    body {
      background: #0d1117;
      color: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
    }
    h1 {
      font-size: 1.2em;
      color: #58a6ff;
      margin-bottom: 20px;
    }
    pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      border-radius: 6px;
      background: #161b22;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
      font-size: 14px;
      line-height: 1.5;
    }
    .nav { margin-bottom: 20px; }
    .nav a { color: #58a6ff; text-decoration: none; }
    .nav a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="nav"><a href="index.html">&larr; Back to index</a></div>
  <h1>${title}</h1>
  <pre><code class="language-liquidsoap">${code}</code></pre>
</body>
</html>`;

const INDEX_TEMPLATE = (files) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Liquidsoap Syntax Highlighting</title>
  <style>
    body {
      background: #0d1117;
      color: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 20px;
      max-width: 900px;
    }
    h1 { color: #58a6ff; }
    h2 { color: #8b949e; font-size: 1em; margin-top: 24px; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 4px 0; }
    a { color: #58a6ff; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .count { color: #8b949e; }
  </style>
</head>
<body>
  <h1>Liquidsoap Syntax Highlighting</h1>
  <p class="count">${files.length} files</p>
  ${files.map(f => `<li><a href="${f.html}">${f.path}</a></li>`).join('\n  ')}
</body>
</html>`;

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  if (!fs.existsSync(LIQUIDSOAP_DIR)) {
    console.error('Liquidsoap directory not found. Run test/run.sh first.');
    process.exit(1);
  }

  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let files = [];
  for (const pattern of PATTERNS) {
    const matches = await glob(pattern, { cwd: LIQUIDSOAP_DIR, absolute: true });
    files = files.concat(matches);
  }

  console.log(`Generating HTML for ${files.length} files...`);

  const index = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(LIQUIDSOAP_DIR, file);
    const htmlPath = relativePath.replace(/\//g, '_').replace('.liq', '.html');
    const outputPath = path.join(OUTPUT_DIR, htmlPath);

    const result = hljs.highlight(content, { language: 'liquidsoap' });
    const html = HTML_TEMPLATE(relativePath, result.value);

    fs.writeFileSync(outputPath, html);
    index.push({ path: relativePath, html: htmlPath });
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), INDEX_TEMPLATE(index));

  console.log(`Generated HTML files in ${OUTPUT_DIR}`);
  console.log(`Open ${path.join(OUTPUT_DIR, 'index.html')} in a browser to view.`);
}

main();
