import { test } from '../../playwright/test';

test('Preferences through click', async ({ page }) => {
  await page.getByTestId('settings-button').click();
  await page.locator('text=Insomnia Preferences').first().click();
});

test('Preferences through keyboard shortcut', async ({ page }) => {
  await page.locator('.app').press(process.platform === 'darwin' ? 'Meta+,' : 'Control+,');
  await page.locator('text=Insomnia Preferences').first().click();
});

// Quick reproduction for Kong/insomnia#5664 and INS-2267
test('Check filter responses by environment preference', async ({ insomnia, page }) => {
  const collectionPage = insomnia.collectionPage;
  await insomnia.importFixture('simple.yaml');

  // Send a request
  await collectionPage.selectCollection('example http');
  await collectionPage.sendRequest();
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('HTTP/1.1 200 OK');

  // Set filter responses by environment
  await insomnia.openPreferences();
  await page.locator('text=Filter responses by environment').click();
  await insomnia.pressEscape();

  // Re-send the request and check timeline
  await collectionPage.sendRequest();
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('HTTP/1.1 200 OK');
});

test('Enable http and https proxies', async ({ insomnia }) => {
  const preference = insomnia.preferences;
  const collectionPage = insomnia.collectionPage;

  await insomnia.openPreferences();
  await preference.fillRequestTimeout('1000');

  await preference.selectTab('Proxy');
  await preference.toggleEnableProxy();
  await preference.fillHttpProxy('127.0.0.1:1111');
  await preference.fillHttpsProxy('127.0.0.1:2222');
  await preference.fillNoProxy('');
  await insomnia.pressEscape();

  await insomnia.importFixture('simple.yaml');

  // send the request and check timeline
  await collectionPage.selectCollection('proxyEnabled');
  await collectionPage.sendRequest();
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('Trying 127.0.0.1:1111'); // updated proxy
});
