import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

test('can send requests', async ({ page, insomnia }) => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');
  const collectionPage = insomnia.collectionPage;
  const statusTag = page.locator('[data-testid="response-status-tag"]:visible');
  await insomnia.importFixture('smoke-test-collection.yaml');

  await collectionPage.exportCollection();
  await insomnia.pressEscape();

  await collectionPage.createInCollection('Curl', 'curl --request GET --url http://127.0.0.1:4010/echo');
  await expect.soft(collectionPage.getUrlInRequestPane(`http://127.0.0.1:4010/echo`)).toBeVisible();
  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('200 OK');

  await collectionPage.selectCollection('send JSON request');
  await expect.soft(collectionPage.getUrlInRequestPane(`http://127.0.0.1:4010/pets/1`)).toBeVisible();

  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.assertResponseBody('"id": "1"');
  await collectionPage.selectPreview('Raw');
  await collectionPage.assertResponseBody('{"id":"1"}');

  await collectionPage.selectCollection('connects to event stream and shows ping response');
  await expect.soft(collectionPage.getUrlInRequestPane(`http://127.0.0.1:4010/events`)).toBeVisible();

  await collectionPage.Connect();
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('Connected to 127.0.0.1');
  await collectionPage.Connect(false);

  await collectionPage.selectCollection('sends dummy.csv request and shows rich response');

  await expect.soft(collectionPage.getUrlInRequestPane(`http://127.0.0.1:4010/file/dummy.csv`)).toBeVisible();

  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.selectPreview('Raw');
  await collectionPage.assertResponseBody('a,b,c');

  await collectionPage.selectCollection('sends dummy.xml request and shows raw response');

  await expect.soft(collectionPage.getUrlInRequestPane(`http://127.0.0.1:4010/file/dummy.xml`)).toBeVisible();

  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.assertResponseBody('xml version="1.0"');
  await collectionPage.assertResponseBody('<LoginResult>');

  await collectionPage.selectCollection('sends dummy.pdf request and shows rich response');

  await expect.soft(collectionPage.getUrlInRequestPane(`http://127.0.0.1:4010/file/dummy.pdf`)).toBeVisible();

  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.selectResponseTab('Console');
  await page.locator('pre').filter({ hasText: '< Content-Type: application/pdf' }).click();

  await collectionPage.selectCollection('sends request with basic authentication');
  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.assertResponseBody('basic auth received');

  await collectionPage.selectCollection('sends request with cookie and get cookie in response');

  await expect.soft(collectionPage.getUrlInRequestPane(`http://127.0.0.1:4010/cookies`)).toBeVisible();
  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('Set-Cookie: insomnia-test-cookie=value123');

  await collectionPage.selectCollection('delayed request');
  await expect.soft(collectionPage.getUrlInRequestPane(`http://127.0.0.1:4010/delay/seconds/20`)).toBeVisible();
  await collectionPage.sendRequest();
  await collectionPage.cancelRequest();
  await page.click('text=Request was cancelled');
});
