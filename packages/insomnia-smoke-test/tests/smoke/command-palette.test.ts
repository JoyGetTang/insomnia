import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

test('Command palette - can switch between requests and workspaces', async ({ app, insomnia, page }) => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');
  // Import a document

  await insomnia.importFixture('swagger2.yaml');
  await insomnia.backToHome();

  // Import a collection
  await insomnia.importFixture('smoke-test-collection.yaml');

  await page
    .getByTestId('sends request with cookie and get cookie in response')
    .getByText('GET', { exact: true })
    .click();
  await page.getByTestId('OneLineEditor').getByText('http://127.0.0.1:4010/cookies').click();
  await page.locator('body').press(process.platform === 'darwin' ? 'Meta+p' : 'Control+p');
  await page.getByPlaceholder('Search and switch between').fill('send js');
  await page.getByPlaceholder('Search and switch between').press('ArrowDown');
  await page.getByPlaceholder('Search and switch between').press('Enter');
  await page.getByTestId('OneLineEditor').getByText('http://127.0.0.1:4010/pets/').click();
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByText('200 OK').click();

  await page.locator('body').press(process.platform === 'darwin' ? 'Meta+p' : 'Control+p');
  await page.getByPlaceholder('Search and switch between').press('ArrowUp');
  await page.getByPlaceholder('Search and switch between').press('ArrowUp');
  await page.getByPlaceholder('Search and switch between').press('ArrowUp');
  await page.getByPlaceholder('Search and switch between').press('ArrowUp');
  await page.getByPlaceholder('Search and switch between').press('Enter');
  await expect
    .soft(page.getByTestId('workspace-context-dropdown').locator('span'))
    .toContainText('E2E testing specification - swagger 2 1.0.0');
});
