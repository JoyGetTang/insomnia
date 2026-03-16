import { test } from '../../playwright/test';

test.describe('REST methods example', () => {
  test('different REST methods example', async ({ page, insomnia }) => {
    const restFolder = 'rest-methods.yaml';
    const testSuite = 'REST Methods Test Suite';
    const tests = [
      {
        id: 'HEAD',
        response: 'No body returned for response',
      },
      {
        id: 'PUT',
        response: 'https://httpbin.org/put',
      },
      {
        id: 'OPTIONS',
        response: 'No body returned for response',
      },
      {
        id: 'PATCH',
        response: 'https://httpbin.org/patch',
      },
      {
        id: 'DELETE',
        response: 'https://httpbin.org/delete',
      },
      {
        id: 'POST',
        response: 'https://httpbin.org/post',
      },
      {
        id: 'GET',
        response: 'https://httpbin.org/get',
      },
    ];
    const collection = insomnia.collectionPage;
    await insomnia.importFixture(restFolder);
    await page.getByTestId(testSuite).getByLabel(testSuite, { exact: true }).click();
    await page.getByText(testSuite).click();

    for (const test of tests) {
      await page.getByTestId(test.id).click();
      await collection.sendRequest();
      await collection.assertResponseBody(test.response);
    }
  });
});
