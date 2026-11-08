#!/usr/bin/env node
// Copy a complete, self-contained skill without modifying existing installations.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const FILES = ['SKILL.md', 'AGENTS.md', 'CLAUDE.md', 'LICENSE', 'README.md',
  'README.zh-CN.md', 'package.json', 'package-lock.json', 'paths.mjs',
  'run_sfx.py', 'sheet.mjs', 'wave.mjs', 'agents', 'docs', 'scripts', 'tests', 'sims', 'sfx'];
const HELP = `Install Teardown (Node.js 20+)
  node scripts/install.mjs [--agent shared|codex|cursor|claude-code] [--project DIR | --global]
  node scripts/install.mjs --target DIR

Default: shared skill at <current directory>/.agents/skills/teardown.
Codex and Cursor both use that shared location; install once for both.
Claude Code uses .claude/skills/teardown. --global uses your home directory.
--target is an exact skill directory for another host (name it teardown).
Existing destinations are never overwritten. Dependencies are installed separately.
`;

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) return console.log(HELP);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (!['--agent', '--project', '--target', '--global'].includes(flag)) throw new Error(`Unknown option: ${flag}`);
    if (Object.hasOwn(opts, flag)) throw new Error(`Repeated option: ${flag}`);
    if (flag === '--global') opts[flag] = true;
    else {
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}`);
      opts[flag] = value;
    }
  }
  if (opts['--global'] && opts['--project']) throw new Error('Choose --project or --global, not both.');
  if (opts['--target'] && (opts['--project'] || opts['--global'] || opts['--agent'])) {
    throw new Error('--target cannot be combined with --agent, --project or --global.');
  }
  const agent = opts['--agent'] || 'shared';
  if (!['shared', 'codex', 'cursor', 'claude-code'].includes(agent)) throw new Error(`Unknown agent: ${agent}`);
  const base = opts['--global'] ? os.homedir() : path.resolve(opts['--project'] || '.');
  const target = opts['--target'] ? path.resolve(opts['--target'])
    : path.join(base, agent === 'claude-code' ? '.claude' : '.agents', 'skills', 'teardown');
  if (path.basename(target) !== 'teardown') throw new Error('The skill directory must be named teardown (matching SKILL.md).');
  // lstat also catches broken symlinks; existsSync alone would miss them.
  try {
    fs.lstatSync(target);
    throw new Error(`Destination already exists; nothing changed: ${target}`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
  fs.mkdirSync(path.dirname(target), {recursive: true});
  const canonicalTarget = path.join(fs.realpathSync(path.dirname(target)), path.basename(target));
  const rel = path.relative(fs.realpathSync(ROOT), canonicalTarget);
  if (!rel || FILES.includes(rel.split(path.sep)[0])) throw new Error('Cannot install inside the packaged source files.');

  // Reserve the destination exclusively. No force/update option: user files are preserved.
  fs.mkdirSync(target);
  try {
    for (const entry of FILES) {
      fs.cpSync(path.join(ROOT, entry), path.join(target, entry), {
        recursive: true, errorOnExist: true, force: false,
        filter: (src) => !['__pycache__', 'node_modules', 'teardown-out', '.git'].includes(path.basename(src)) && !src.endsWith('.pyc'),
      });
    }
  } catch (err) {
    fs.rmSync(target, {recursive: true, force: true});
    throw err;
  }
  console.log(`Installed: ${target}\nOpen that directory and run npm ci, then npm run doctor.\nFor visual review: npx playwright install chromium.\nRestart or refresh the host if the skill does not appear.`);
}

try { main(); } catch (err) { console.error(err.message); process.exitCode = 1; }
