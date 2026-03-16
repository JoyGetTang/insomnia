import path from 'node:path';

import { expect } from '@playwright/test';

import { getFixturePath } from '../../playwright/paths';
import { test } from '../../playwright/test';

test('can send gRPC requests using mTLS requests (with reflection)', async ({ insomnia, page }) => {
  // test failed because there is a problem with the authentication in Client.crt.
  test.skip();

  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  const collectionPage = insomnia.collectionPage;
  const preferencePage = insomnia.preferences;
  const statusTag = collectionPage.statusTag;

  await insomnia.importFixture('grpc-mtls.yaml');
  await collectionPage.selectCollection('grpcs');
  await expect.soft(page.getByRole('button', { name: 'Select Method' })).toBeDisabled();

  // add root CA and client certificate
  const fixturePath = getFixturePath('certificates');

  // add the path to allowed data folder list
  await insomnia.openPreferences();
  await preferencePage.addFolder(fixturePath);
  await insomnia.pressEscape();

  await collectionPage.addCaCertificates(path.join(fixturePath, 'rootCA.pem'));

  await collectionPage.addClientCertificates(
    path.join(fixturePath, 'client.crt'),
    path.join(fixturePath, 'client.key'),
  );

  // initiates an mtls connection with the given certificates
  await collectionPage.clickReflectiongRPC();
  await collectionPage.selectMethod('RouteGuide/GetFeature');

  await collectionPage.selectRequestConfig('Unary');
  await collectionPage.sendRequest();

  // Check for the single Unary response
  await expect.soft(statusTag).toContainText('0 OK');
  await collectionPage.assertResponseBody('Berkshire Valley Management Area Trail');
});
