import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

test('can send gRPC requests with reflection', async ({ insomnia }) => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');
  const collectionPage = insomnia.collectionPage;
  const statusTag = collectionPage.statusTag;

  await insomnia.importFixture('grpc.yaml');
  await collectionPage.selectCollection('UnaryWithOutProtoFile');
  await collectionPage.clickReflectiongRPC();

  await collectionPage.selectMethod('RouteGuide/GetFeature');
  await collectionPage.selectRequestConfig('Unary');
  await collectionPage.sendRequest();

  // Check for the single Unary response
  await expect.soft(statusTag).toContainText('0 OK');
  await collectionPage.assertResponseBody('Berkshire Valley Management Area Trail');
});
