import { test } from '../../playwright/test';

test.describe('MCP client test', () => {
  test('create mcp client', async ({ insomnia, page }) => {
    const mcp = 'https://mcp.deepwiki.com/mcp';
    const collectionPage = insomnia.collectionPage;
    await insomnia.addNewFile('MCP');
    await collectionPage.connectMcpClient(mcp);

    const toolTests = [
      {
        tool: 'read_wiki_structure',
        repoName: 'Kong/insomnia',
        question: undefined,
        expectedResponse: 'Available pages for Kong/insomnia',
      },
      {
        tool: 'read_wiki_contents',
        repoName: 'Kong/insomnia',
        question: undefined,
        expectedResponse: `"isError": false`,
      },
      {
        tool: 'ask_question',
        repoName: 'Kong/insomnia',
        question: 'how are you',
        expectedResponse: `"isError": false`,
      },
    ];

    for (const testConfig of toolTests) {
      await collectionPage.selectTool(testConfig.tool);
      await page.locator('#root_repoName').fill(testConfig.repoName);

      if (testConfig.question !== undefined) {
        await page.locator('#root_question').fill(testConfig.question);
      }
      await collectionPage.callTool();
      await collectionPage.assertResponseBody(testConfig.expectedResponse);
    }
  });
});
