import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const doctor = fileURLToPath(new URL('../scripts/doctor.mjs', import.meta.url));
const run = (args, env = {}) => spawnSync(process.execPath, [doctor, ...args], {encoding: 'utf8', env: {...process.env, ...env}});

test('HTML checks do not require optional recording binaries', () => {
  const result = run([], {FFMPEG: '/missing/ffmpeg', PYTHON: '/missing/python', CHROMIUM: '/missing/chromium'});
  assert.equal(result.status, 0, result.stderr);
});

test('requested capture and sound checks fail actionably when binaries are absent', () => {
  const result = run(['--capture', '--sound'], {FFMPEG: '/missing/ffmpeg', PYTHON: '/missing/python', CHROMIUM: '/missing/chromium'});
  assert.equal(result.status, 1);
  assert.match(result.stderr, /FAIL Chromium/);
  assert.match(result.stderr, /FAIL ffmpeg/);
  assert.match(result.stderr, /FAIL Python 3/);
});

test('missing build dependencies and unknown options return failure', () => {
  assert.equal(run([], {TEARDOWN_DEPS: '/missing/deps'}).status, 1);
  assert.equal(run(['--unknown']).status, 1);
});
