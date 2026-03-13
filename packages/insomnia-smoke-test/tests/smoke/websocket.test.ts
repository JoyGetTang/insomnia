import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test('can make websocket connection', async ({ insomnia, page }) => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');
  const collectionPage = insomnia.collectionPage;
  const statusTag = collectionPage.statusTag;

  await insomnia.importFixture('websockets.yaml');
  await collectionPage.selectCollection('localhost:4010');
  await expect.soft(page.locator('.app')).toContainText('ws://localhost:4010');
  await collectionPage.Connect();
  await expect.soft(statusTag).toContainText('101 Switching Protocols');
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('WebSocket connection established');
  await collectionPage.Connect(false);
  await collectionPage.assertResponseBody('Closing connection with code 1005');

  // Can connect with Basic Auth
  await collectionPage.selectCollection('basic-auth');
  await expect.soft(page.locator('.app')).toContainText('ws://localhost:4010/basic-auth');
  await collectionPage.Connect();
  await expect.soft(statusTag).toContainText('101 Switching Protocols');
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('> authorization: Basic dXNlcjpwYXNzd29yZA==');

  // Can connect with Bearer Auth
  await collectionPage.selectCollection('bearer');
  await expect.soft(page.locator('.app')).toContainText('ws://localhost:4010/bearer');
  await collectionPage.Connect();
  await expect.soft(statusTag).toContainText('101 Switching Protocols');
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('> authorization: Bearer insomnia-cool-token-!!!1112113243111');

  // Can handle redirects
  await collectionPage.selectCollection('redirect');
  await expect.soft(page.locator('.app')).toContainText('ws://localhost:4010/redirect');
  await collectionPage.Connect();
  await expect.soft(statusTag).toContainText('101 Switching Protocols');
  await collectionPage.selectResponseTab('Console');
  await collectionPage.assertResponseBody('WebSocket connection established');

  const webSocketActiveConnections = page.getByTestId('WebSocketSpinner__Connected');

  // Basic auth, Bearer auth, and Redirect connections are displayed as open
  await expect.soft(webSocketActiveConnections).toHaveCount(3);

  // Can disconnect from all connections
  await page.locator('button[name="DisconnectDropdown__DropdownButton"]').click();
  await page.getByRole('menuitem', { name: 'Disconnect all requests' }).click();
  await expect.soft(webSocketActiveConnections).toHaveCount(0);
});
