import path from 'node:path';

import { expect } from '@playwright/test';

import { getFixturePath } from '../../playwright/paths';
import { test } from '../../playwright/test';

test('can use client certificate for mTLS', async ({ insomnia, page }) => {
  const collectionPage = insomnia.collectionPage;
  const statusTag = collectionPage.statusTag;
  const preferencePage = insomnia.preferences;

  await insomnia.openPreferences();
  await preferencePage.addFolder(getFixturePath(path.join('certificates', 'client')));
  await expect.soft(page.getByText('client')).toBeVisible();
  await preferencePage.addFolder(getFixturePath(getFixturePath(path.join('certificates', 'rootCA.pem'))));
  await expect.soft(page.getByText('rootCA.pem')).toBeVisible();
  await insomnia.pressEscape();

  await insomnia.importFixture('client-certs.yaml');

  await collectionPage.selectCollection('pet 2 with url var');
  await collectionPage.sendRequest();
  await collectionPage.assertResponseBody('Error: SSL peer certificate or SSH remote key was not OK');

  const fixturePath = getFixturePath('certificates');
  await collectionPage.addCaCertificates(path.join(fixturePath, 'rootCA.pem'));
  await collectionPage.sendRequest();

  await expect.soft(statusTag).toContainText('401 Unauthorized');
  await collectionPage.assertResponseBody('Client certificate required');

  await collectionPage.addClientCertificates(
    path.join(fixturePath, 'client.crt'),
    path.join(fixturePath, 'client.key'),
  );

  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.assertResponseBody('"id": "2"');

  // ensure disabling the cert actually disables it
  await page.getByRole('button', { name: 'Add Certificates' }).click();
  await page.locator('[data-test-id="client-certificate-toggle"]').click();
  await page.getByRole('button', { name: 'Done' }).click();
  await collectionPage.selectCollection('pet 2');
  await expect
    .soft(
      page
        .getByLabel('Request Collection')
        .getByRole('row', { name: 'pet 2' })
        .first()
        .locator('[data-selected="true"]')
        .first(),
    )
    .toBeVisible();

  await collectionPage.sendRequest();
  await expect.soft(statusTag).toContainText('401 Unauthorized');
  await collectionPage.assertResponseBody('Client certificate required');
});
