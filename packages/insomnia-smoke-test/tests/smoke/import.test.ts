import { expect, Page } from '@playwright/test';
import { test } from '../../playwright/test';

test.describe('tests of file types and upload methods included in the import function', () => {
  test('Can import multiple workspaces from single file', async ({ insomnia, page }) => {
    const multipleFile = 'import/multiple-workspaces.yaml';
    // clipboard way + yaml
    await insomnia.importFixture(multipleFile);
    // Have two collections in current project
    await expect.soft(insomnia.workspaceLocator('Collection 1')).toBeVisible();
    await expect.soft(insomnia.workspaceLocator('Collection 2')).toBeVisible();

    await insomnia.openWorkspace('Collection 2');
    await expect.soft(page.getByTestId('workspace-context-dropdown').getByText(`Collection 2`)).toBeVisible();
  });

  test('Can generate content-type header from imported postman file', async ({ insomnia, page }) => {
    // file way + postman
    const postmanFile = 'import/import-content-type-from-postman.json';
    const collectionPage = insomnia.collectionPage;
    await insomnia.importFixture(postmanFile, 'file');

    // Navigate into the imported request and check content-type header
    await collectionPage.selectCollection('New Request');
    await collectionPage.selectResponseTab('Headers');
    await expect.soft(page.getByText('application/x-www-form-urlencoded')).toBeAttached();
  });

  test('Can import by url', async ({ insomnia, page }) => {
    // Swagger + url
    const url = 'https://petstore.swagger.io/v2/swagger.json';
    await insomnia.importFixture(url, 'url');
    await expect(page.getByRole('heading', { name: 'Swagger Petstore 1.0.7 OAS' })).toBeInViewport();
  });

  test('Can import cURL', async ({ insomnia, page }) => {
    // cURL + OpenAPI
    const response = `["ada","android","apex","asciidoc","bash","c","clojure","cpp-qt-client","cpp-restsdk","cpp-tiny","cpp-tizen","cpp-ue4","crystal","csharp","cwiki","dart","dart-dio","dynamic-html","eiffel","elixir","elm","erlang-client","erlang-proper","gdscript","go","groovy","haskell-http-client","html","html2","java","java-helidon-client","java-micronaut-client","javascript","javascript-apollo-deprecated","javascript-closure-angular","javascript-flowtyped","jaxrs-cxf-client","jetbrains-http-client","jmeter","julia-client","k6","kotlin","lua","markdown","n4js","nim","objc","ocaml","openapi","openapi-yaml","perl","php","php-dt","php-nextgen","plantuml","powershell","python","python-pydantic-v1","r","ruby","rust","scala-akka","scala-gatling","scala-http4s","scala-pekko","scala-sttp","scala-sttp4","scalaz","swift-combine","swift5","swift6","typescript","typescript-angular","typescript-aurelia","typescript-axios","typescript-fetch","typescript-inversify","typescript-jquery","typescript-nestjs","typescript-node","typescript-redux-query","typescript-rxjs","xojo-client","zapier"]`;
    const cURL = 'curl -X GET "https://api.openapi-generator.tech/api/gen/clients" -H "Accept: */*"';
    const collectionPage = insomnia.collectionPage;
    await insomnia.importFixture(cURL, 'cURL');
    await collectionPage.sendRequest();
    await collectionPage.selectPreview('Raw');
    await collectionPage.assertResponseBody(response);
  });

  test('Can import HAR file', async ({ insomnia, page }) => {
    // HAR file
    const HAR = 'import/simple.har';
    const collectionPage = insomnia.collectionPage;
    await insomnia.importFixture(HAR, 'file');
    await collectionPage.selectCollection('https://en.wikipedia.org/api/rest_v1/page/summary/Palmyra');
    await collectionPage.sendRequest();
    await collectionPage.assertResponseBody('200 OK');
  });

  test('Can import WSDL file', async ({ insomnia, page }) => {
    // WSDL file
    const WSDL = 'import/simple.wsdl';
    const collectionPage = insomnia.collectionPage;
    await insomnia.importFixture(WSDL, 'file');
    await collectionPage.selectCollection('GetWeather');
    await collectionPage.sendRequest();
    await collectionPage.assertResponseBody('404 Not Found');
  });
});
