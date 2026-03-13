import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test('Can import multiple workspaces from single file', async ({ insomnia, page }) => {
  await insomnia.importFixture('import/multiple-workspaces.yaml');

  // Have two collections in current project
  await expect.soft(insomnia.workspaceLocator('Collection 1')).toBeVisible();
  await expect.soft(insomnia.workspaceLocator('Collection 2')).toBeVisible();

  await insomnia.openWorkspace('Collection 2');
  await expect.soft(page.getByTestId('workspace-context-dropdown').getByText(`Collection 2`)).toBeVisible();
});

test('Can generate content-type header from imported postman file', async ({ insomnia, page }) => {
  const collectionPage = insomnia.collectionPage;
  await insomnia.importFixture('import/import-content-type-from-postman.json');

  // Navigate into the imported request and check content-type header
  await collectionPage.selectCollection('New Request');
  await collectionPage.selectResponseTab('Headers');
  await expect.soft(page.getByText('application/x-www-form-urlencoded')).toBeAttached();
});
