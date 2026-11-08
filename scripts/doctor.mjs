#!/usr/bin/env node
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {CHROMIUM, DEPS, FFMPEG, FFPROBE, PYTHON, fromDeps} from '../paths.mjs';

const flags = new Set(process.argv.slice(2));
if (flags.has('--help') || flags.has('-h')) {
  console.log('Usage: node scripts/doctor.mjs [--capture] [--video] [--sound]\nDefault checks HTML build dependencies. --capture adds Chromium; --video adds Chromium, ffmpeg and ffprobe; --sound adds Python 3 and ffmpeg.');
} else if ([...flags].some(f => !['--capture', '--video', '--sound'].includes(f))) {
  console.error('Unknown option. Use --help.');
  process.exitCode = 1;
} else {
  let failures = 0;
  const check = (name, fn) => {
    try { console.log(`OK   ${name}: ${fn()}`); }
    catch (e) { failures++; console.error(`FAIL ${name}: ${e.message}`); }
  };
  const binary = (exe, args) => {
    const result = spawnSync(exe, args, {encoding: 'utf8', timeout: 10000, windowsHide: true});
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`${exe} exited with ${result.status}`);
    return (result.stdout || result.stderr).trim().split(/\r?\n/)[0];
  };
  check('Node.js', () => {
    if (Number(process.versions.node.split('.')[0]) < 20) throw new Error('Node.js 20+ required');
    return process.version;
  });
  for (const id of ['esbuild', 'three', '@fontsource-variable/inter', '@fontsource/jetbrains-mono', 'playwright']) {
    check(id, () => {
      const manifest = JSON.parse(fs.readFileSync(`${DEPS}/${id}/package.json`, 'utf8'));
      return manifest.version;
    });
  }
  if (flags.has('--capture') || flags.has('--video')) check('Chromium', () => {
    const exe = CHROMIUM || fromDeps('playwright').chromium.executablePath();
    if (!fs.existsSync(exe)) throw new Error('Run npx playwright install chromium or set CHROMIUM to an executable path');
    fs.accessSync(exe, fs.constants.X_OK);
    return `${exe} (presence check; actual WebGL is verified during capture)`;
  });
  if (flags.has('--video') || flags.has('--sound')) check('ffmpeg', () => binary(FFMPEG, ['-version']));
  if (flags.has('--video')) check('ffprobe', () => binary(FFPROBE, ['-version']));
  if (flags.has('--sound')) check('Python 3', () => binary(PYTHON, ['-c', 'import sys; assert sys.version_info.major == 3; print(sys.version.split()[0])']));
  if (failures) process.exitCode = 1;
  else console.log('Selected prerequisites are available. This does not validate rendering or GPU performance.');
}
