import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

test.describe('gRPC interactions', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test('can send all types of requests', async ({ insomnia }) => {
    const collectionPage = insomnia.collectionPage;
    const statusTag = collectionPage.statusTag;

    await insomnia.importFixture('grpc.yaml');

    await collectionPage.selectCollection('Unary');
    await collectionPage.sendRequest();

    // Check for the single Unary response
    await expect.soft(statusTag).toContainText('0 OK');
    await collectionPage.assertResponseBody('Berkshire Valley Management Area Trail');

    await collectionPage.selectCollection('Bidirectional Stream');
    await collectionPage.selectRequestConfig('Bi-directional Streaming');
    await collectionPage.start();

    // Stream 3 client messages
    await collectionPage.addStream(3);

    // Check for the 3rd stream and response
    await collectionPage.selectRequestConfig('Stream 3');
    await collectionPage.selectResponseTab('Response 3');

    // Finish the stream
    await collectionPage.clickCommit();
    await expect.soft(statusTag).toContainText('0 OK');

    await collectionPage.selectCollection('Client Stream');
    await collectionPage.selectRequestConfig('Client Streaming');
    await collectionPage.start();

    // Stream 3 client messages
    await collectionPage.addStream(3);

    // Finish the stream and check response
    await collectionPage.clickCommit();
    await collectionPage.selectRequestConfig('Stream 3');
    await collectionPage.selectResponseTab('Response 1');
    await expect.soft(statusTag).toContainText('0 OK');
    await collectionPage.assertResponseBody('point_count": 3');

    await collectionPage.selectCollection('Server Stream');
    await collectionPage.selectRequestConfig('Server Streaming');
    await collectionPage.start();

    // Check response
    await expect.soft(statusTag).toContainText('0 OK');
    await collectionPage.assertResponseBody('Patriots Path');
    await collectionPage.selectResponseTab('Response 54');
  });
});
