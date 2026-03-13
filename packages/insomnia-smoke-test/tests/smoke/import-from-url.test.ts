import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test.describe('Import from URL', () => {
  test.beforeEach(async ({ insomnia }) => {
    await insomnia.importFixture('import-from-url.yaml');
  });

  test('Should work as expected in HTTP request', async ({ insomnia }) => {
    const collectionPage = insomnia.collectionPage;
    const statusTag = collectionPage.statusTag;

    const requestUrl = 'http://localhost:4010/echo?foo=bar&baz=qux';
    await collectionPage.selectCollection('example http');

    await collectionPage.clickImportFromUrl();
    await expect.soft(collectionPage.getUrlInRequestPane('http://localhost:4010/echo')).toBeVisible();

    // send
    await collectionPage.sendRequest();

    // verify response
    await expect.soft(statusTag).toContainText('200 OK');

    await collectionPage.selectResponseTab('Console');

    await collectionPage.assertResponseBody(requestUrl);
  });

  test('Should work as expected in Websocket request', async ({ insomnia }) => {
    const collectionPage = insomnia.collectionPage;
    const statusTag = collectionPage.statusTag;
    const requestUrl = 'ws://localhost:4010?foo=bar&baz=qux';

    await collectionPage.selectCollection('example websocket');

    await collectionPage.clickImportFromUrl();
    await expect.soft(collectionPage.getUrlInRequestPane('ws://localhost:4010')).toBeVisible();

    // connect
    await collectionPage.Connect();

    // verify response
    await expect.soft(statusTag).toContainText('101 Switching Protocols');

    await collectionPage.selectResponseTab('Console');

    await collectionPage.assertResponseBody(requestUrl);
  });
});
