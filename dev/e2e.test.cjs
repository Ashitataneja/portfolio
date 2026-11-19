const { chromium } = require('playwright');
const SP = process.argv[2];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 810 }, acceptDownloads: true });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
  const ok = (name, cond) => console.log((cond ? 'PASS ' : 'FAIL ') + name);
  const hash = () => p.evaluate(() => location.hash);
  await p.goto('http://localhost:8765/');
  // 01-03 intro: wait for print, click photo
  await p.waitForSelector('.fc-photo.is-ready', { timeout: 9000 });
  ok('intro prints photo and waits', (await hash()) === '' || (await hash()) === '#/');
  await p.click('.fc-photo'); await p.waitForTimeout(1800);
  ok('photo click -> home', (await hash()) === '#/home');
  // 04 dial: keyboard rotate then Enter
  await p.focus('.dial__label.is-selected'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(700);
  ok('dial rotates to Archive', await p.$eval('.dial__label.is-selected b', e => e.textContent) === 'Archive');
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(700);
  // direct click on Contact segment label = rotate + open
  await p.click('.dial__label[data-i="4"]'); await p.waitForTimeout(1600);
  ok('direct click Contact opens contact', (await hash()) === '#/contact');
  // 18 contact dial
  await p.focus('.cdial__opt.is-on'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(600);
  ok('contact -> LinkedIn screen', /LinkedIn/.test(await p.textContent('.ccam__screen')));
  const lhref = await p.getAttribute('.ccam__cta', 'href'); ok('LinkedIn CTA has real URL', /^https:\/\/www\.linkedin\.com\//.test(lhref));
  await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500);
  ok('contact -> Say Hello mailto', /^mailto:ashita\.taneja@gmail\.com\?subject=/.test(await p.getAttribute('.ccam__cta', 'href')));
  // navigate screen via home camera
  await p.goto('http://localhost:8765/#/navigate'); await p.waitForTimeout(900);
  await p.click('.dial__center--lens'); await p.waitForTimeout(1500);
  ok('navigate lens opens remembered selection (Contact)', (await hash()) === '#/contact');
  await p.goto('http://localhost:8765/#/work'); await p.waitForTimeout(900);
  // 06-08 work → unclip → project
  await p.click('.hang[data-id="03"]'); await p.waitForTimeout(2900);
  ok('unclip -> project 03', (await hash()) === '#/work/03');
  ok('project 03 visual is p03', (await p.getAttribute('.project__card img', 'src')).includes('p03'));
  await p.click('text=Back to work'); await p.waitForTimeout(1200);
  ok('back to work keeps project 03 marked', await p.$eval('.hang.is-sel', e => e.dataset.id) === '03');
  await p.goto('http://localhost:8765/#/work/03'); await p.waitForTimeout(900);
  await p.click('text=Open case study'); await p.waitForTimeout(1100);
  ok('open case study -> overview', (await hash()) === '#/work/03/overview');
  await p.click('.overview__actions .btn'); await p.waitForTimeout(1100);
  ok('enter -> stage 1', (await hash()) === '#/work/03/case/1');
  await p.click('.case__shutter'); await p.waitForTimeout(1100);
  ok('shutter -> stage 2', (await hash()) === '#/work/03/case/2' && /Research/.test(await p.textContent('.case__title')));
  await p.click('.case__ev-open'); await p.waitForTimeout(400);
  ok('evidence opens', !!(await p.$('.case__evidence')));
  await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  ok('evidence closes, stage preserved', !(await p.$('.case__evidence')) && (await hash()) === '#/work/03/case/2');
  await p.click('.case__chip[data-k="5"]'); await p.waitForTimeout(1100);
  ok('process index jumps to Prototyping', /Prototyping/.test(await p.textContent('.case__title')));
  await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(700);
  ok('keyboard previous -> Ideation', /Ideation/.test(await p.textContent('.case__title')));
  await p.goto('http://localhost:8765/#/work/03/overview'); await p.waitForTimeout(800);
  ok('overview offers resume at stage 5', /case\/5$/.test(await p.getAttribute('.overview__actions .btn', 'href')));
  // 12-13 archive
  await p.goto('http://localhost:8765/#/archive'); await p.waitForTimeout(900);
  await p.click('.pile__photo[data-id="flowers"]', { force: true }); await p.waitForTimeout(1600);
  ok('pile click -> film roll flowers', (await hash()) === '#/archive/flowers');
  ok('flowers frame active', await p.$eval('.film__frame.is-active img', e => e.src.includes('flowers')));
  await p.click('.film__nav--r'); await p.waitForTimeout(700);
  ok('next frame -> park', (await hash()) === '#/archive/park');
  await p.click('.film__frame.is-active'); await p.waitForTimeout(400);
  ok('active frame opens lightbox', !!(await p.$('.lightbox')));
  await p.keyboard.press('Escape');
  await p.click('text=Back to gallery'); await p.waitForTimeout(900);
  ok('back to gallery marks last viewed', await p.$eval('.pile__photo.is-last', e => e.dataset.id) === 'park');
  // 14-15 journal
  await p.goto('http://localhost:8765/#/notes'); await p.waitForTimeout(900);
  await p.click('.book__cover'); await p.waitForTimeout(900);
  ok('journal opens', await p.$eval('.book', e => e.classList.contains('is-open')));
  await p.click('.entry[data-slug="chasing-sunsets"]'); await p.waitForTimeout(1300);
  ok('entry -> article', (await hash()) === '#/notes/chasing-sunsets');
  await p.click('a[rel="next"]'); await p.waitForTimeout(1300);
  ok('next article -> the-art-of-places', (await hash()) === '#/notes/the-art-of-places');
  await p.click('text=Back to Journal'); await p.waitForTimeout(1100);
  ok('back to journal: open, last entry marked', await p.$eval('.book', e => e.classList.contains('is-open')) && await p.$eval('.entry.is-last', e => e.dataset.slug) === 'the-art-of-places');
  // 16 about scratch: mouse scratch first tile, keyboard the rest
  await p.goto('http://localhost:8765/#/about'); await p.waitForTimeout(1000);
  const bx = await (await p.$('.tile[data-id="education"] canvas')).boundingBox();
  await p.mouse.move(bx.x + 2, bx.y + 4); await p.mouse.down();
  for (let row = 0; row < 7; row++) for (let k = 0; k <= 10; k++) await p.mouse.move(bx.x + (row % 2 ? 10 - k : k) * bx.width / 10, bx.y + row * bx.height / 6, { steps: 2 });
  await p.mouse.up(); await p.waitForTimeout(400);
  ok('mouse scratch reveals Education', await p.$eval('.tile[data-id="education"]', e => e.classList.contains('is-revealed')));
  for (const id of ['me', 'do', 'like', 'experience', 'facts']) { await p.focus(`.tile[data-id="${id}"] .tile__media`); await p.keyboard.press('Enter'); await p.waitForTimeout(650); }
  await p.waitForTimeout(1500);
  ok('all revealed -> emoji rain', !!(await p.$('.emoji-rain')));
  await p.waitForSelector('.keepsake [data-dl]:not([disabled])', { timeout: 8000 });
  await p.screenshot({ path: SP + '/e2e-keepsake.png' });
  const [kd] = await Promise.all([p.waitForEvent('download'), p.click('.keepsake [data-dl]')]);
  await kd.saveAs(SP + '/keepsake.png'); ok('keepsake downloads', /keepsake\.png$/.test(kd.suggestedFilename()));
  await p.click('.keepsake [data-close]');
  // colour slider persists
  await p.click('.cbar__mode[data-mode="tritanopia"]'); await p.waitForTimeout(200);
  const pinkT = await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c-pink').trim());
  ok('tritan mode at 100% maps pink -> #e46fec', pinkT.toLowerCase() === '#e46fec');
  await p.$eval('.cbar__range', e => { e.value = 50; e.dispatchEvent(new Event('input', { bubbles: true })); }); await p.waitForTimeout(200);
  await p.goto('http://localhost:8765/#/postcard'); await p.waitForTimeout(900);
  ok('colour setting persists across screens/reload', await p.$eval('.cbar__range', e => e.value) === '50' && await p.$eval('.cbar__mode[aria-checked="true"]', e => e.dataset.mode) === 'tritanopia');
  await p.click('.cbar__reset'); await p.waitForTimeout(200);
  ok('reset restores original pink', (await p.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--c-pink').trim())).toLowerCase() === '#f996d8');
  // 20-21 postcard
  ok('continue disabled without selection', await p.getAttribute('.pchoose__go', 'aria-disabled') === 'true');
  await p.click('.pchoose__ph[data-id="cat"]'); await p.waitForTimeout(700);
  ok('cat selected + counter', await p.textContent('.pchoose__count') .then(t => /1 selected/.test(t)));
  await p.click('.pchoose__go'); await p.waitForTimeout(1600);
  ok('continue -> preview cat', (await hash()) === '#/postcard/cat');
  await p.waitForSelector('[data-dl]:not([disabled])');
  const [pd] = await Promise.all([p.waitForEvent('download'), p.click('[data-dl]')]);
  await pd.saveAs(SP + '/postcard.png'); ok('postcard downloads', /postcard-cat\.png$/.test(pd.suggestedFilename()));
  await p.click('text=Choose another photo'); await p.waitForTimeout(900);
  ok('choose another keeps cat selected', await p.$eval('.pchoose__ph.is-sel', e => e.dataset.id) === 'cat');
  await p.click('.pchoose__back'); await p.waitForTimeout(900);
  ok('back to website returns to last page (about)', (await hash()) === '#/about');
  // 19 exit intent
  await p.mouse.move(700, 300); await p.mouse.move(700, 2); await p.mouse.move(700, -5);
  await p.evaluate(() => document.documentElement.dispatchEvent(new MouseEvent('mouseout', { clientY: -2, bubbles: true, relatedTarget: null })));
  await p.waitForTimeout(600);
  ok('exit intent shows invitation', !!(await p.$('.exit__card')));
  await p.screenshot({ path: SP + '/e2e-exit.png' });
  await p.click('text=Maybe later'); await p.waitForTimeout(400);
  await p.evaluate(() => document.documentElement.dispatchEvent(new MouseEvent('mouseout', { clientY: -2, bubbles: true })));
  await p.waitForTimeout(400);
  ok('invitation shows only once per session', !(await p.$('.exit__card')));
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
  await b.close();
})();
