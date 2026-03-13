import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test('can make socket.io connection', async ({ insomnia, page }) => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');
  const collectionPage = insomnia.collectionPage;
  const statusTag = collectionPage.statusTag;
  await insomnia.importFixture('socket-io.yaml');
  await collectionPage.selectCollection('Socket.IO Request');
  await expect.soft(page.locator('.app')).toContainText('http://localhost:4020');
  await collectionPage.Connect();
  await expect.soft(statusTag).toContainText('Connected', { ignoreCase: true });
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('Connected to http://localhost:4020');
  await collectionPage.Connect(false);
  await collectionPage.assertResponseBody('io client disconnect');

  await collectionPage.Connect();
  const connections = page.getByTestId('SocketIOSpinner__Connected');
  await expect.soft(connections).toHaveCount(1);

  await collectionPage.Connect(false);
  await expect.soft(connections).toHaveCount(0);
});
