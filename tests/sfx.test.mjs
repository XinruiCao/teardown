import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const available = spawnSync(python, ['--version']).status === 0;

test('sample decoder honors FFMPEG paths with spaces and defaults to PATH', {skip: !available}, () => {
  const script = `
import importlib, os
from types import SimpleNamespace
from unittest.mock import patch
import sfx.synth as synth
for configured in (None, '/custom tools/ffmpeg'):
    with patch.dict(os.environ, {}, clear=False):
        os.environ.pop('FFMPEG', None)
        if configured is not None:
            os.environ['FFMPEG'] = configured
        importlib.reload(synth)
        with patch.object(synth.subprocess, 'run', return_value=SimpleNamespace(stdout=b'\\x00\\x40')) as run:
            assert synth.sample('some audio.ogg', dur=0.1) == [0.5]
            command = run.call_args.args[0]
            assert command[0] == (configured or 'ffmpeg'), command
            assert command[command.index('-i') + 1].endswith('some audio.ogg')
`;
  const result = spawnSync(python, ['-c', script], {cwd: root, encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
});
