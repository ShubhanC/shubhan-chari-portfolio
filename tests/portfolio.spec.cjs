const { test, expect } = require('@playwright/test');

test('keyboard users can unlock and open a project', async ({ page }) => {
  await page.goto('/');
  const unlock = page.getByRole('button', { name: 'Unlock portfolio' });
  await expect(unlock).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(unlock).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.home-screen')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Personal', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: /Personal Projects.*return home/ })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /Brain Tumor Classifier/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Brain Tumor Classifier' })).toBeVisible();
});

test('home starts at an inactive focus target and Tab outlines only the grid icons', async ({ page }) => {
  await page.goto('/');
  await page.locator('#lock-screen h1').click();
  const home = page.locator('.home-screen');
  const personal = page.getByRole('button', { name: 'Personal', exact: true });
  await expect(home).toBeFocused();
  await expect(home).toHaveCSS('outline-style', 'none');
  await page.keyboard.press('Enter');
  await expect(home).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(personal).toBeFocused();
  await expect(personal).toHaveCSS('outline-style', 'none');
  await expect(personal.locator('.app-icon')).toHaveCSS('outline-style', 'solid');

  for (const name of ['Open Source', 'Research', 'Coursework', 'Maps']) {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name, exact: true })).toBeFocused();
  }
  const maps = page.getByRole('button', { name: 'Maps', exact: true });
  await expect(maps).toHaveCSS('outline-style', 'none');
  await expect(maps.locator('.app-icon')).toHaveCSS('outline-style', 'solid');

  for (const name of ['Photos', 'Pinterest', 'GitHub', 'Canva', 'Contacts']) {
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name, exact: true })).toBeFocused();
  }
  await expect(page.getByRole('button', { name: 'Contacts', exact: true })).toHaveCSS('outline-style', 'solid');

  await personal.click();
  const back = page.getByRole('button', { name: /Personal Projects.*return home/ });
  await expect(back).toBeFocused();
  await expect(back).toHaveCSS('outline-style', 'none');
  await back.click();
  await expect(home).toBeFocused();
});

test('phone fits short and narrow viewports after resize', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Unlock portfolio' })).toBeVisible();
  for (const [width, height] of [[320, 568], [667, 375]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('#phone-container')).toBeInViewport({ ratio: 1 });
  }
});

for (const [name, respond] of [
  ['network failure', route => route.abort()],
  ['malformed project data', route => route.fulfill({ json: { projects: [{}] } })]
]) {
  test(`portfolio can retry after ${name}`, async ({ page }) => {
    await page.route('**/data/projects.json', respond, { times: 1 });
    await page.goto('/');
    await expect(page.getByRole('alert')).toHaveText('Could not load the portfolio.');
    await page.getByRole('button', { name: 'Retry' }).click();
    await page.getByRole('button', { name: 'Unlock portfolio' }).click();
    await expect(page.getByRole('button', { name: 'Personal', exact: true })).toBeVisible();
  });
}

for (const app of ['Photos', 'GitHub', 'Maps', 'Pinterest']) {
  test(`${app} video returns home on click and when playback ends`, async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Unlock portfolio' }).click();
    const icon = page.getByRole('button', { name: app, exact: true });
    const video = page.locator('#app-video');
    await icon.click();
    await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(0);
    await video.click();
    await expect(icon).toBeEnabled();

    await icon.click();
    // Play the actual file through to its native ended event.
    await video.evaluate(el => { el.playbackRate = 4; });
    await expect(icon).toBeEnabled({ timeout: 15_000 });
  });
}
