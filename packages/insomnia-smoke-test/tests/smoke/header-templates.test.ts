import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test('can requests that contain templated header keys and values', async ({ insomnia }) => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  const collectionPage = insomnia.collectionPage;
  const statusTag = collectionPage.statusTag;

  await insomnia.importFixture('header-templates.yaml');

  await collectionPage.selectCollection('pet2');

  await collectionPage.sendRequest();

  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.selectPreview('Raw');
  await collectionPage.assertResponseBody('{"id":"2"}');
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('X-Foo-Bar: baz');
});
