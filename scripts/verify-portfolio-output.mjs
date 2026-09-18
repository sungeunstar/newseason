import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const report = JSON.parse(await readFile(path.join(root, '_audit', 'verify-final.json'), 'utf8'));
const html = await readFile(path.join(root, 'portfolio.html'), 'utf8');
const renders = (await readdir(path.join(root, '_audit', 'final-pages'))).filter((name) => /^p\d{2}\.png$/.test(name));
const pages = report.pages;
const width = report.pageWidths.length === 1 ? report.pageWidths[0] : 0;
const broken = report.brokenImages.length;
const consoleErrors = report.consoleErrors.length;
const staticOk = html.includes('width:1280px') && renders.length === 31 && report.documentHeight === 31 * 720;

if (!staticOk || pages !== 31 || width !== 1280 || broken !== 0 || consoleErrors !== 0) {
  console.error(`VERIFY_FAIL pages=${pages} width=${width} broken=${broken} consoleErrors=${consoleErrors} renders=${renders.length}`);
  process.exit(1);
}

console.log(`VERIFY_PASS pages=${pages} width=${width} broken=${broken} consoleErrors=${consoleErrors}`);
