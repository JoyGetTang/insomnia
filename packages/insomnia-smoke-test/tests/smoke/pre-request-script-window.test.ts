import { expect } from '@playwright/test';

import { loadFixture } from '../../playwright/paths';
import { test } from '../../playwright/test';

test.describe('test hidden window handling', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test('can cancel pre-request script', async ({ insomnia }) => {
    const collectionPage = insomnia.collectionPage;
    const statusTag = collectionPage.statusTag;
    await insomnia.importFixture('pre-request-collection.yaml');
    await collectionPage.exportCollection();
    await insomnia.pressEscape();

    await collectionPage.selectCollection('Long running task');
    await collectionPage.sendRequest();

    await collectionPage.cancelRequest();

    // check the response pane message
    await collectionPage.assertResponseBody('Request was cancelled');

    await collectionPage.selectCollection('Special template tag format');
    await collectionPage.sendRequest();
    await expect.soft(statusTag).toContainText('200 OK');

    await collectionPage.selectCollection('Multiple template tags format');
    await collectionPage.sendRequest();
    await expect.soft(statusTag).toContainText('200 OK');
  });

  test('handle hidden browser window getting closed', async ({ insomnia, app }) => {
    await insomnia.importFixture('pre-request-collection.yaml');

    const preference = insomnia.preferences;
    const collectionPage = insomnia.collectionPage;
    const statusTag = collectionPage.statusTag;

    await insomnia.openPreferences();
    await preference.fillRequestTimeout('1000');
    await preference.close();

    await collectionPage.selectCollection('Long running task - post');
    await collectionPage.sendRequest();
    await collectionPage.assertResponseBody('Executing script timeout');

    const windows = app.windows();
    const hiddenWindow = windows[1];
    hiddenWindow.close();

    await insomnia.openPreferences();
    await preference.fillRequestTimeout('6000');
    await preference.close();

    await collectionPage.sendRequest();

    // it should still work
    await expect.soft(statusTag).toContainText('200 OK');
  });

  test('window should be restarted if it hangs', async ({ app, insomnia, page }) => {
    const preference = insomnia.preferences;
    const collectionPage = insomnia.collectionPage;
    const statusTag = collectionPage.statusTag;

    // load collection
    await insomnia.importFixture('pre-request-collection.yaml');

    // update timeout
    await insomnia.openPreferences();
    await preference.fillRequestTimeout('5000');
    await preference.close();

    // send the request with infinite loop script
    await collectionPage.selectCollection('infinite loop');
    await collectionPage.sendRequest();
    // await page.getByText('Timeout: Hidden browser window is not responding').click();

    await collectionPage.assertResponseBody('Executing script timeout');

    // send the another script with normal script
    await collectionPage.selectCollection('simple log');

    await expect.soft(collectionPage.getUrlInRequestPane('http://127.0.0.1:4010/echo?simple=true')).toBeVisible();

    await collectionPage.sendRequest();

    // it should still work
    await expect.soft(statusTag).toContainText('200 OK');
  });
});
