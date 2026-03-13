import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test('can make oauth2 requests', async ({ insomnia, page }) => {
  const collectionPage = insomnia.collectionPage;
  const statusTag = collectionPage.statusTag;
  const preferencePage = insomnia.preferences;

  await insomnia.importFixture('oauth.yaml');

  // Test Folder Level Auth propagates to heirs

  // select the folder (collapses heirs
  await collectionPage.selectFolder('Folder Level Auth Code');
  await collectionPage.selectRequestConfig('Auth');
  await collectionPage.clearOauth2Session();

  // expand the folder to see the heirs again
  await collectionPage.selectFolder('Folder Level Auth Code');
  await collectionPage.selectCollection('Request with Inherited Auth');
  await expect.soft(page.locator('.app')).toContainText('http://127.0.0.1:4010/oidc/me');
  await collectionPage.fillElectron('folder', 'folder');
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.assertResponseBody('"sub": "folder"');

  // go back to the folder's auth tab
  await collectionPage.selectFolder('Folder Level Auth Code');
  await collectionPage.selectRequestConfig('Auth');

  // clear the session (but keep the token!)
  await collectionPage.clearOauth2Session();

  // reset ui state
  await collectionPage.selectFolder('Folder Level Auth Code');

  // No PKCE
  await collectionPage.selectCollection('No PKCE');
  await expect.soft(page.locator('.app')).toContainText('http://127.0.0.1:4010/oidc/me');
  await collectionPage.fillElectron('admin', 'admin');
  await expect.soft(statusTag).toContainText('200 OK');
  await collectionPage.assertResponseBody('"sub": "admin"');

  // Navigate to the OAuth2 Tab and refresh the token from there
  await collectionPage.selectRequestConfig('Auth');
  await expect.soft(page.getByRole('button', { name: 'OAuth 2.0' })).toBeVisible();

  const tokenInput = page.locator('[for="Access-Token"] > input');
  const prevToken = await tokenInput.inputValue();
  await page.locator('button:has-text("Refresh Token")').click();
  await expect.soft(tokenInput).not.toHaveValue(prevToken);

  // Clear the session and tokens and fetch a token manually
  await page.locator('text=Advanced Options').click();
  await page.locator('button:has-text("Clear OAuth 2 session")').click();
  await page.locator('button:text-is("Clear")').click();

  await collectionPage.fillElectron('admin', 'admin', page.locator('button:has-text("Fetch Tokens")').click());

  await expect.soft(tokenInput).not.toHaveValue('');

  const runOAuth2Test = async (
    collectionName: string,
    expectedResponseBody: string,
    expectedGrantType: string | undefined,
    expectedChallengeMethod: string | undefined,
    sendRequest: boolean,
    loginCredentials?: { username: string; password: string },
  ) => {
    await collectionPage.selectCollection(collectionName);

    if (expectedGrantType) {
      expectedGrantType == 'implicit' && (await page.getByRole('tab', { name: 'Auth' }).click());
      await expect.soft(page.locator('#Grant-Type')).toHaveValue(expectedGrantType);
    }
    if (expectedChallengeMethod) {
      await expect.soft(page.locator('#Code-Challenge-Method')).toHaveValue(expectedChallengeMethod);
    }

    sendRequest && (await collectionPage.sendRequest());
    loginCredentials && (await collectionPage.fillElectron(loginCredentials.username, loginCredentials.password));

    await expect.soft(statusTag).toContainText('200 OK');
    await collectionPage.assertResponseBody(expectedResponseBody);
  };

  // PKCE SHA256
  await runOAuth2Test('PKCE SHA256', '"sub": "admin"', 'authorization_code', 'S256', true);

  // PKCE Plain
  await runOAuth2Test('PKCE Plain', '"sub": "admin"', 'authorization_code', 'plain', true);

  // Inherited Auth from folder
  await runOAuth2Test('Request with Inherited Auth', '"sub": "folder"', undefined, undefined, true);

  // test to ensure that the token does not persist after clearing the folder's auth
  await page.getByTestId('Folder Level Auth Code').click();
  await page.getByRole('tab', { name: 'Auth' }).click();
  await page.getByRole('button', { name: 'Clear', exact: true }).click();

  // clear the session, too (so we can get a fresh one)
  await page.getByRole('button', { name: 'Clear OAuth 2 session', exact: true }).click();
  await page.getByTestId('Folder Level Auth Code').click(); // re-expand

  // try the request again, note that it attempts to re-authenticate
  // instead of re-using the original token (the real fix)
  await runOAuth2Test('Request with Inherited Auth', '"sub": "fresh"', undefined, undefined, false, {
    username: 'fresh',
    password: 'fresh',
  });

  // Reset the OAuth 2 session from Preferences
  await preferencePage.clearOAuthSession();

  // ID Token

  await runOAuth2Test('ID Token', '"sub": "admin"', 'implicit', undefined, false, {
    username: 'admin',
    password: 'admin',
  });

  // ID and Access Token
  await runOAuth2Test('ID and Access Token', '"sub": "admin"', 'implicit', undefined, true);

  // Reset the OAuth 2 session from Preferences
  await preferencePage.clearOAuthSession();

  // Client Credentials
  await runOAuth2Test('Client Credentials', '"clientId": "client_credentials"', 'client_credentials', undefined, true);

  // Reset the OAuth 2 session from Preferences
  await preferencePage.clearOAuthSession();

  // Resource Owner Password Credentials
  await runOAuth2Test('Resource Owner Password Credentials', '"sub": "foo"', 'password', undefined, true);
});
