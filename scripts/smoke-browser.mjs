#!/usr/bin/env node
// Optional end-to-end check: run `npm run build` and install Chromium first.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {CHROMIUM, CHROMIUM_ARGS, DIST, OUT, playwright} from '../paths.mjs';

const out = path.join(OUT, 'review');
fs.mkdirSync(out, {recursive: true});
const browser = await playwright().chromium.launch({executablePath: CHROMIUM, args: CHROMIUM_ARGS});
try {
  const context = await browser.newContext({viewport: {width: 1600, height: 900}, deviceScaleFactor: 1, offline: true});
  for (const name of ['v8-film', 'cessna-film', 'strandbeest-film', 'v8-live', 'cessna-live', 'strandbeest-live']) {
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    const errors = [];
    const remote = [];
    page.on('pageerror', e => { errors.push(e.message); console.error(`[${name}] ${e.message}`); });
    page.on('console', msg => {
      if (msg.type() === 'error') { errors.push(msg.text()); console.error(`[${name}] ${msg.text()}`); }
    });
    page.on('request', req => { if (/^https?:/.test(req.url())) remote.push(req.url()); });
    const film = name.endsWith('-film');
    if (film) await page.addInitScript(() => { window.__CAPTURE = true; });
    await page.goto(pathToFileURL(path.join(DIST, `${name}.html`)).href);
    if (film) {
      await page.waitForFunction(() => window.SIM?.ready);
      await page.evaluate(() => {
        // Deliberately out of order: rendering must not depend on previous frames.
        for (const t of [0, window.SIM.duration * 0.8, 1, window.SIM.duration / 2]) window.SIM.render(t);
      });
    } else {
      await page.waitForFunction(() => document.querySelector('.tourchip')?.textContent.includes('AUTO TOUR'));
      if (name === 'v8-live') {
        await page.locator('.tb').filter({hasText: 'PAUSE'}).click();
        await page.waitForFunction(() => [...document.querySelectorAll('.tb')].some(e => e.textContent.includes('PLAY')));
        assert.match(await page.locator('.tourchip').innerText(), /RESUME TOUR/);
        await page.locator('.tb').filter({hasText: /^Section$/i}).click();
        await page.mouse.move(850, 450);
        await page.mouse.down();
        await page.mouse.move(920, 480, {steps: 5});
        await page.mouse.up();
        await page.mouse.wheel(0, 100);
        await page.locator('.tourchip').click();
        await page.waitForFunction(() => document.querySelector('.tourchip').textContent.includes('AUTO TOUR'));
      }
    }
    await page.evaluate(() => document.fonts.ready);
    assert.ok(await page.locator('#gl').evaluate(canvas => canvas.width > 0 && canvas.height > 0));
    await page.screenshot({path: path.join(out, `${name}.png`)});
    assert.deepEqual(remote, [], `${name} attempted network access`);
    assert.deepEqual(errors, [], `${name} browser errors`);
    console.log(`PASS ${name}: offline rendering${name === 'v8-live' ? ', pause, cutaway, orbit, zoom and tour handover' : ''}`);
    await page.close();
  }
  console.log(`Review screenshots: ${out}`);
} finally {
  await browser.close();
}
