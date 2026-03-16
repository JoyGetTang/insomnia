import { expect } from '@playwright/test';
import { test } from '../../playwright/test';
import { ExampleOption } from '../../playwright/pages/components/document';

test.describe('document page operations', () => {
  test('use different example', async ({ page, insomnia }) => {
    const examples: { name: ExampleOption; heading: string }[] = [
      { name: 'Pet Store', heading: 'Swagger Petstore - OpenAPI 3.' },
      { name: 'Todo List', heading: 'Simple TODO API 1.0.0 OAS' },
      { name: 'Empty', heading: 'API 0.0.0 OAS' },
    ];

    const documentPage = insomnia.document;

    for (const example of examples) {
      await insomnia.createDocument();
      await documentPage.useExample(example.name);
      await documentPage.togglePreview();
      await expect(page.getByRole('heading', { name: example.heading })).toBeInViewport();
      await insomnia.backToHome();
      await insomnia.actions('Delete');
    }
  });

  test('import URL', async ({ page, insomnia }) => {
    const documentPage = insomnia.document;
    const url = 'https://petstore.swagger.io/v2/swagger.json';

    await insomnia.createDocument();
    await documentPage.importUrl(url);
    await documentPage.togglePreview();
    await expect(page.getByRole('heading', { name: 'Swagger Petstore 1.0.7 OAS' })).toBeInViewport();
  });

  test('import from Collection and test in Tests', async ({ page, insomnia }) => {
    const documentPage = insomnia.document;
    const collectionPage = insomnia.collectionPage;
    const cURL = 'curl -X GET "https://api.openapi-generator.tech/api/gen/clients" -H "Accept: */*"';
    const test = 'https://api.openapi-generator';

    await insomnia.createDocument();
    await documentPage.switchWorkspace('Collection');
    await collectionPage.createInCollection('File');
    await insomnia.importFixture(cURL, 'cURL');
    await collectionPage.sendRequest();
    await collectionPage.assertResponseBody('200 OK');

    await documentPage.switchWorkspace('Tests');
    await documentPage.addNewTestsuite();
    await documentPage.addNewTest(test);
    await documentPage.runTest();
    await expect(page.getByRole('heading', { name: 'Tests passed 1/1' })).toBeInViewport();
  });
});
