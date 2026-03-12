import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test.describe('after-response script features tests', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');
  test('all', async ({ page, insomnia }) => {
    const collectionPage = insomnia.collectionPage;
    const statusTag = collectionPage.statusTag;

    // import global environment
    // test use clipboard to import fixture
    await insomnia.importFixture('clipboard', 'script-global-environment.yaml');
    await page.getByTestId('project').click();
    // import collection with after-response scripts
    // test use upload-file to import fixture
    await insomnia.importFixture('file', 'after-response-collection.yaml');
    // set transient var
    await collectionPage.selectCollection('transient var');

    // send
    await collectionPage.sendRequest();
    await collectionPage.clickTestsTab();

    // verify response
    await expect.soft(statusTag).toContainText('200 OK');

    // verify
    await collectionPage.clickTestsTab();

    await expect.soft(collectionPage.rows).toContainText('PASS');

    // post: insomnia.test and insomnia.expect can work together
    await collectionPage.selectCollection('tests with expect and test');

    // send
    await collectionPage.sendRequest();
    // verify
    await collectionPage.clickTestsTab();

    const responsePane = collectionPage.responsePane;
    const expectedFragments = [
      'PASS',
      'FAILunhappy tests | error: AssertionError: expected 199 to deeply equal 200 | ACTUAL: 199 | EXPECTED: 200',
      'FAILsadTestInFunc | error: AssertionError: expected 199 to deeply equal 200 | ACTUAL: 199 | EXPECTED: 200',
      'PASShappyTestInFunc',
      'PASSasyncHappyTestInFunc',
      'FAILasyncSadTestInFunc | error: AssertionError: expected 199 to deeply equal 200 | ACTUAL: 199 | EXPECTED: 200',
    ];

    await Promise.all(expectedFragments.map(fragment => expect.soft(responsePane).toContainText(fragment)));

    // environment and baseEnvironment can be persisted
    await collectionPage.selectCollection('persist environments');
    // send
    await collectionPage.sendRequest();

    // verify response
    await expect.soft(statusTag).toContainText('200 OK');

    // verify persisted environment
    await collectionPage.clickBaseEnvironment();
    await collectionPage.clickEditBaseEnvironment();

    const tableData = await collectionPage.baseEnvironmentTable.allInnerTexts();
    const bodyJson = JSON.parse(tableData.join(' '));
    expect.soft(bodyJson).toEqual({
      // no environment is selected so the environment value will be persisted to the base environment
      __fromAfterScript1: 'baseEnvironment',
      __fromAfterScript2: 'collection',
      __fromAfterScript: 'environment',
      base_url: 'http://localhost:4010',
    });

    await collectionPage.closeManageEnvironments();

    // globals and baseGlobals can be persisted
    await insomnia.clickBody();
    await collectionPage.selectCollection('persist global environment');
    // activate global sub environment
    await collectionPage.clickBaseEnvironment();
    await collectionPage.selectGlobalEnvironment();
    await collectionPage.selectOption('Script Environment');
    await collectionPage.selectOption('Sub Script Env');

    await insomnia.clickBody();
    // send
    await collectionPage.sendRequest();
    // check when activate global sub environment, globals refers to the selected while baseGlobals refers to the base env
    await collectionPage.clickConsoleTab();
    await page.getByText('log: globals sub').click();
    await page.getByText('log: baseGlobals base').click();
    // view sub environment has been updated
    await collectionPage.clickBaseEnvironment();
    await collectionPage.clickManageGlobalEnvironment();
    await page.getByLabel('Environment name').getByText('Sub Script Env').first().click();
    let globalSubEditor = page.getByTestId('CodeEditor').locator('.CodeMirror-line');
    let globalSubRows = await globalSubEditor.allInnerTexts();
    let globalSubBodyJson = JSON.parse(globalSubRows.join(' '));
    expect.soft(globalSubBodyJson).toEqual({
      // if select global sub environment, globals will point to the selected sub environment
      __env_source: 'sub',
      __fromGlobals: 'selectedGlobal',
    });
    await page.getByLabel('Environment name').getByText('Base Script Env').click();
    globalSubEditor = page.getByTestId('CodeEditor').locator('.CodeMirror-line');
    globalSubRows = await globalSubEditor.allInnerTexts();
    globalSubBodyJson = JSON.parse(globalSubRows.join(' '));
    expect.soft(globalSubBodyJson).toEqual({
      // if select global sub environment, baseGlobals will point to the base environment of the selected one
      __env_source: 'base',
      __fromBaseGlobals: 'selectedBaseGlobal',
    });
  });
});
