import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test.describe('Import from URL', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test.beforeEach(async ({ insomnia }) => {
    await insomnia.importFixture('graphql.yaml');
  });

  test('can render schema and send GraphQL requests', async ({ insomnia, page }) => {
    const collectionPage = insomnia.collectionPage;
    const statusTag = collectionPage.statusTag;

    // Open the graphql request
    await collectionPage.selectCollection('GraphQL request');
    await collectionPage.selectRequestConfig('Body');
    // Assert the schema is fetched after switching to GraphQL request
    await expect.soft(page.getByText('Schema fetched just now')).toBeVisible();

    // Assert schema documentation stuff
    await page.getByRole('button', { name: 'schema' }).click();
    await page.getByRole('menuitem', { name: 'Show Documentation' }).click();
    await page.click('a:has-text("Query")');
    await page.locator('a:has-text("RingBearer")').click();
    const graphqlExplorer = page.locator('.graphql-explorer');
    await expect.soft(graphqlExplorer).toContainText('Characters who at any time bore a Ring of Power.');
    await page.click('text=QueryRingBearer >> button');

    // Send and assert GraphQL request
    await collectionPage.sendRequest();
    await expect.soft(statusTag).toContainText('200 OK');

    // Export GraphQL request
    await page.getByText('GraphQL request with number').click();
    await page.getByTestId('Dropdown-GraphQL-request-with-number').click();

    await page.getByRole('menuitemradio', { name: 'Generate Code' }).click();
    await page.getByText('"query": "query($inputVar: Int) { echoNum(intVar: $inputVar)}",').click();
    await page.getByRole('button', { name: 'Done' }).click();

    await collectionPage.sendRequest();
    await collectionPage.assertResponseBody('"echoNum": 777');
  });

  test('can render schema and send GraphQL requests with object variables', async ({ insomnia, page }) => {
    const collectionPage = insomnia.collectionPage;

    // Open the graphql request
    await collectionPage.selectCollection('GraphQL request with variables');
    await collectionPage.selectRequestConfig('Body');
    // Assert the schema is fetched after switching to GraphQL request
    await expect.soft(page.getByText('Schema fetched just now')).toBeVisible();

    // Assert schema documentation stuff
    await page.getByRole('button', { name: 'schema' }).click();
    await page.getByRole('menuitem', { name: 'Show Documentation' }).click();
    await page.click('a:has-text("Query")');
    await page.locator('a:has-text("RingBearer")').click();
    const graphqlExplorer2 = page.locator('.graphql-explorer');
    await expect.soft(graphqlExplorer2).toContainText('Characters who at any time bore a Ring of Power.');
    await page.click('text=QueryRingBearer >> button');

    // Send and assert GraphQL request
    await collectionPage.sendRequest();
    const statusTag2 = page.locator('[data-testid="response-status-tag"]:visible');
    await expect.soft(statusTag2).toContainText('200 OK');
    await collectionPage.assertResponseBody('"echoVars": null');
  });

  test('can render numeric environment', async ({ app, page }) => {
    // Open the graphql request
    await page.getByLabel('Request Collection').getByTestId('GraphQL request with number').press('Enter');
    await page.getByRole('tab', { name: 'Body' }).click();
    // Assert the schema is fetched after switching to GraphQL request
    await expect.soft(page.getByText('Schema fetched just now')).toBeVisible();

    // Assert schema documentation stuff
    await page.getByRole('button', { name: 'schema' }).click();
    await page.getByRole('menuitem', { name: 'Show Documentation' }).click();
    await page.click('a:has-text("Query")');
    await page.locator('a:has-text("RingBearer")').click();
    const graphqlExplorer2 = page.locator('.graphql-explorer');
    await expect.soft(graphqlExplorer2).toContainText('Characters who at any time bore a Ring of Power.');
    await page.click('text=QueryRingBearer >> button');

    // Send and assert GraphQL request
    await page.click('[data-testid="request-pane"] >> text=Send');
    const statusTag2 = page.locator('[data-testid="response-status-tag"]:visible');
    await expect.soft(statusTag2).toContainText('200 OK');

    const responseBody2 = page.locator('[data-testid="response-pane"] >> [data-testid="CodeEditor"]:visible', {
      has: page.locator('.CodeMirror-activeline'),
    });
    await expect.soft(responseBody2).toContainText('"echoNum": 777');
  });

  test('can send GraphQL requests after editing and prettifying query', async ({ page, insomnia }) => {
    const collectionPage = insomnia.collectionPage;

    // Edit and prettify query
    await collectionPage.selectCollection('GraphQL request');
    await page.getByRole('tab', { name: 'Body' }).click();
    await page.locator('pre[role="presentation"]:has-text("bearer")').click();
    await page.locator('.app').press('Enter');
    await page.locator('text=Prettify GraphQL').click();
    await page.click('[data-testid="request-pane"] >> text=Send');
    const statusTag = page.locator('[data-testid="response-status-tag"]:visible');
    await expect.soft(statusTag).toContainText('200 OK');

    const responseBody = page.locator('[data-testid="response-pane"] >> [data-testid="CodeEditor"]:visible', {
      has: page.locator('.CodeMirror-activeline'),
    });
    await expect.soft(responseBody).toContainText('"bearer": "Gandalf"');
  });
});
