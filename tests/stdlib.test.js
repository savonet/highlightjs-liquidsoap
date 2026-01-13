import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import hljs from 'highlight.js';
import { glob } from 'glob';
import liquidsoap from '../src/languages/liquidsoap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

hljs.registerLanguage('liquidsoap', liquidsoap);

const LIQUIDSOAP_DIR = path.join(__dirname, 'liquidsoap');
const PATTERNS = [
  'src/**/*.liq',
  'tests/**/*.liq'
];

function testFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(LIQUIDSOAP_DIR, filePath);

  try {
    const result = hljs.highlight(content, { language: 'liquidsoap' });

    if (result.errorRaised) {
      return { file: relativePath, error: result.errorRaised };
    }

    const hasHighlights = result.value.includes('class="hljs-');

    if (!hasHighlights && content.trim().length > 0) {
      return { file: relativePath, warning: 'No syntax highlighting produced' };
    }

    return { file: relativePath, success: true, relevance: result.relevance };
  } catch (err) {
    return { file: relativePath, error: err.message };
  }
}

async function main() {
  if (!fs.existsSync(LIQUIDSOAP_DIR)) {
    console.error('Liquidsoap directory not found. Run tests/run.sh first.');
    process.exit(1);
  }

  let files = [];
  for (const pattern of PATTERNS) {
    const matches = await glob(pattern, { cwd: LIQUIDSOAP_DIR, absolute: true });
    files = files.concat(matches);
  }

  console.log(`Testing ${files.length} files...\n`);

  const errors = [];
  const warnings = [];
  let successCount = 0;

  for (const file of files) {
    const result = testFile(file);
    if (result.error) {
      errors.push(result);
      console.log(`ERROR: ${result.file}`);
      console.log(`  ${result.error}\n`);
    } else if (result.warning) {
      warnings.push(result);
    } else {
      successCount++;
    }
  }

  console.log(`\nResults:`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Warnings: ${warnings.length}`);
  console.log(`  Errors: ${errors.length}`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

main();
