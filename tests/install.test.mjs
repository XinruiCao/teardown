import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const install = path.join(root, 'scripts/install.mjs');
function sandbox(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'teardown test '));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  return dir;
}
const run = (args, cwd) => spawnSync(process.execPath, [install, ...args], {cwd, encoding: 'utf8'});

test('shared installation works from another cwd and builds after relocation', t => {
  const project = sandbox(t);
  const result = run(['--agent', 'codex', '--project', project], os.tmpdir());
  assert.equal(result.status, 0, result.stderr);
  const target = path.join(project, '.agents/skills/teardown');
  for (const file of ['SKILL.md', 'agents/openai.yaml', 'docs/agents.md', 'sims/kit/runtime.js', 'sfx/samples/SOURCES.md', 'package-lock.json']) {
    assert.ok(fs.existsSync(path.join(target, file)), file);
  }
  for (const file of ['.git', 'node_modules', 'teardown-out']) assert.equal(fs.existsSync(path.join(target, file)), false);
  const built = spawnSync(process.execPath, [path.join(target, 'sims/build.mjs'), 'v8-live'], {
    cwd: project, encoding: 'utf8', env: {...process.env, TEARDOWN_DEPS: path.join(root, 'node_modules'), TEARDOWN_OUT: path.join(project, 'out with spaces')},
  });
  assert.equal(built.status, 0, built.stderr);
  const html = fs.readFileSync(path.join(project, 'out with spaces/dist/v8-live.html'), 'utf8');
  assert.match(html, /<canvas|createElement\("canvas"\)/);
  assert.ok(html.length > 100000);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:/);
});

test('Cursor uses the shared location and never overwrites an existing installation', t => {
  const project = sandbox(t);
  assert.equal(run(['--agent', 'cursor', '--project', project], project).status, 0);
  const file = path.join(project, '.agents/skills/teardown/SKILL.md');
  fs.writeFileSync(file, 'user changes');
  const second = run(['--project', project], project);
  assert.equal(second.status, 1);
  assert.match(second.stderr, /already exists/);
  assert.equal(fs.readFileSync(file, 'utf8'), 'user changes');
});

test('Claude and explicit targets receive complete packages', t => {
  const project = sandbox(t);
  assert.equal(run(['--agent', 'claude-code', '--project', project], project).status, 0);
  assert.ok(fs.existsSync(path.join(project, '.claude/skills/teardown/paths.mjs')));
  const target = path.join(project, 'custom skills/teardown');
  assert.equal(run(['--target', target], project).status, 0);
  assert.ok(fs.existsSync(path.join(target, 'sims/capture.mjs')));
});

test('reject invalid options without creating a skill', t => {
  const project = sandbox(t);
  for (const args of [['--agent', 'unknown'], ['--project'], ['--global', '--project', project],
    ['--target', path.join(project, 'teardown'), '--agent', 'codex'], ['--force']]) {
    assert.equal(run(args, project).status, 1, args.join(' '));
  }
  assert.deepEqual(fs.readdirSync(project), []);
});

test('existing broken symlink is preserved', {skip: process.platform === 'win32'}, t => {
  const project = sandbox(t);
  const target = path.join(project, 'teardown');
  fs.symlinkSync(path.join(project, 'missing'), target);
  assert.equal(run(['--target', target], project).status, 1);
  assert.ok(fs.lstatSync(target).isSymbolicLink());
});
