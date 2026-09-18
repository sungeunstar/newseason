import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tomob = path.resolve(root, '..', '..');
const auditScript = 'C:/Users/sltim/.codex/skills/genesis-design/scripts/audit-ui.mjs';
const auditTargets = ['portfolio.html', 'topping.html', 'topping.css', 'flowing.html', 'flowing.css', 'skaldworks.html', 'skaldworks.css', 'scripts/build-portfolio.mjs'];
const audit = spawnSync(process.execPath, [auditScript, ...auditTargets], { cwd: root, encoding: 'utf8' });
process.stdout.write(audit.stdout);
process.stderr.write(audit.stderr);
const summary = audit.stdout.match(/Summary · critical (\d+) · major (\d+)/);
if (audit.status !== 0 || !summary || Number(summary[1]) !== 0 || Number(summary[2]) !== 0) process.exit(1);

const system = spawnSync(process.execPath, ['scripts/check-system-rules.mjs'], { cwd: tomob, encoding: 'utf8' });
process.stdout.write(system.stdout);
process.stderr.write(system.stderr);
if (system.status !== 0 || !system.stdout.includes('PASS: SYSTEM_CORE.md has no duplicate OP codes')) process.exit(1);

console.log('FINAL_CHECKS_PASS');
