import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import hljs from 'highlight.js';
import { glob } from 'glob';
import liquidsoap from '../src/languages/liquidsoap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

hljs.registerLanguage('liquidsoap', liquidsoap);

let hasErrors = false;

// Test markup files in test/markup/liquidsoap/
async function runMarkupTests() {
  console.log('=== Markup Tests ===\n');

  const markupDir = path.join(__dirname, 'markup', 'liquidsoap');
  if (!fs.existsSync(markupDir)) {
    console.log('No markup tests found.\n');
    return;
  }

  const files = await glob('*.txt', { cwd: markupDir, absolute: true });
  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const name = path.basename(file, '.txt');
    const content = fs.readFileSync(file, 'utf8');

    try {
      const result = hljs.highlight(content, { language: 'liquidsoap' });

      if (result.errorRaised) {
        console.log(`FAIL: ${name}`);
        console.log(`  Error: ${result.errorRaised}\n`);
        failed++;
        hasErrors = true;
      } else if (!result.value.includes('class="hljs-')) {
        console.log(`FAIL: ${name}`);
        console.log('  No syntax highlighting produced\n');
        failed++;
        hasErrors = true;
      } else {
        console.log(`PASS: ${name}`);
        passed++;
      }
    } catch (err) {
      console.log(`FAIL: ${name}`);
      console.log(`  ${err.message}\n`);
      failed++;
      hasErrors = true;
    }
  }

  console.log(`\nMarkup tests: ${passed} passed, ${failed} failed\n`);
}

// Test language detection files in test/detect/liquidsoap/
async function runDetectTests() {
  console.log('=== Detection Tests ===\n');

  const detectDir = path.join(__dirname, 'detect', 'liquidsoap');
  if (!fs.existsSync(detectDir)) {
    console.log('No detection tests found.\n');
    return;
  }

  const files = await glob('*.txt', { cwd: detectDir, absolute: true });
  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const name = path.basename(file, '.txt');
    const content = fs.readFileSync(file, 'utf8');

    try {
      const result = hljs.highlightAuto(content);

      if (result.language === 'liquidsoap') {
        console.log(`PASS: ${name} (relevance: ${result.relevance})`);
        passed++;
      } else {
        console.log(`FAIL: ${name}`);
        console.log(`  Detected as: ${result.language || 'unknown'} (relevance: ${result.relevance})`);
        console.log(`  Expected: liquidsoap\n`);
        failed++;
        hasErrors = true;
      }
    } catch (err) {
      console.log(`FAIL: ${name}`);
      console.log(`  ${err.message}\n`);
      failed++;
      hasErrors = true;
    }
  }

  console.log(`\nDetection tests: ${passed} passed, ${failed} failed\n`);
}

// Test against Liquidsoap stdlib
async function runStdlibTests() {
  console.log('=== Stdlib Tests ===\n');

  const liquidsoapDir = path.join(__dirname, 'liquidsoap');
  if (!fs.existsSync(liquidsoapDir)) {
    console.log('Cloning Liquidsoap repository...\n');
    execSync('git clone --depth=1 https://github.com/savonet/liquidsoap.git liquidsoap', {
      cwd: __dirname,
      stdio: 'inherit'
    });
    console.log('');
  }

  const patterns = ['src/**/*.liq', 'tests/**/*.liq'];
  let files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { cwd: liquidsoapDir, absolute: true });
    files = files.concat(matches);
  }

  console.log(`Testing ${files.length} files from Liquidsoap repo...\n`);

  let successCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(liquidsoapDir, file);

    try {
      const result = hljs.highlight(content, { language: 'liquidsoap' });

      if (result.errorRaised) {
        console.log(`ERROR: ${relativePath}`);
        console.log(`  ${result.errorRaised}\n`);
        errorCount++;
        hasErrors = true;
      } else if (!result.value.includes('class="hljs-') && content.trim().length > 0) {
        warningCount++;
      } else {
        successCount++;
      }
    } catch (err) {
      console.log(`ERROR: ${relativePath}`);
      console.log(`  ${err.message}\n`);
      errorCount++;
      hasErrors = true;
    }
  }

  console.log(`\nStdlib tests: ${successCount} success, ${warningCount} warnings, ${errorCount} errors\n`);
}

async function main() {
  console.log('Highlight.js Liquidsoap Grammar Tests\n');
  console.log('=====================================\n');

  await runMarkupTests();
  await runDetectTests();
  await runStdlibTests();

  if (hasErrors) {
    console.log('Some tests failed!');
    process.exit(1);
  } else {
    console.log('All tests passed!');
  }
}

main();
