import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

test('can render Spectral OpenAPI lint errors', async ({ page, insomnia }) => {
  const documentsPage = insomnia.document;
  await insomnia.createDocument();
  await documentsPage.useExample('Pet Store');

  const codeEditor = page.locator('.pane-one');
  await expect.soft(codeEditor).toContainText('openapi: 3.0.4');
  await page.getByText('No lint problems').click();
  // Cause a lint error
  await page.locator('[data-testid="CodeEditor"] >> text=info').click();
  page.keyboard.insertText(' !@#$%^&*(');
  await page.getByText('Lint problems detected').click();

  await page.getByLabel('Toggle lint panel').click();
  await page.getByRole('option', { name: 'oas3-schema must have' }).click();
});
