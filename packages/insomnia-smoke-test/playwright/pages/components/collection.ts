import { expect, type ElectronApplication, type Locator, type Page } from '@playwright/test';

/*
 * Component for the **Collection page**
 */

type PreviewType = 'Visual' | 'Source' | 'Raw';
type CreateInCollectionType = 'New' | 'HTTP' | 'SSE' | 'GraphQL' | 'gRPC' | 'WebSocket' | 'Socket.IO' | 'Curl' | 'File';
export class CollectionPage {
  statusTag: Locator;
  rows: Locator;
  responsePane: Locator;
  baseEnvironment: Locator;
  editBaseEnvironmentButton: Locator;
  baseEnvironmentTable: Locator;
  closeMangeEnvironmentsButton: Locator;
  selectEnvironment: Locator;
  manageGlobalEnvironment: Locator;
  constructor(
    readonly page: Page,
    readonly app: ElectronApplication,
  ) {
    this.statusTag = page.locator('[data-testid="response-status-tag"]:visible');
    this.rows = page.getByTestId('test-result-row');
    this.responsePane = page.getByTestId('response-pane');
    this.baseEnvironment = page.getByRole('button', { name: 'Manage Environments' });
    this.editBaseEnvironmentButton = page.getByRole('button', { name: 'Manage collection environments' });
    this.baseEnvironmentTable = page.getByRole('dialog').getByTestId('CodeEditor').locator('.CodeMirror-line');
    this.closeMangeEnvironmentsButton = page.getByRole('button', { name: 'Close', exact: true });
    this.selectEnvironment = page.getByPlaceholder('Choose a global environment');
    this.manageGlobalEnvironment = page.getByLabel('Manage global environment');
  }

  async selectCollection(name: string): Promise<void> {
    await this.page.getByLabel('Request Collection').getByTestId(name).press('Enter');
  }

  async selectFolder(name: string): Promise<void> {
    await this.page.getByTestId(name).click();
  }

  async sendRequest(): Promise<void> {
    await this.page.getByTestId('request-pane').getByRole('button', { name: 'Send' }).click();
  }

  async start(): Promise<void> {
    await this.page.getByTestId('request-pane').getByRole('button', { name: 'start' }).click();
  }

  async Connect(isConnected: boolean = true): Promise<void> {
    isConnected
      ? await this.page.getByTestId('request-pane').getByRole('button', { name: 'Connect' }).click()
      : await this.page.getByTestId('request-pane').getByRole('button', { name: 'Disconnect' }).click();
  }

  async selectResponseTab(type: string): Promise<void> {
    try {
      await this.page.getByRole('tab', { name: type }).click();
    } catch (error) {
      await this.page.getByRole('tab', { name: type, exact: true }).click();
    }
  }
  async clickBaseEnvironment(): Promise<void> {
    await this.baseEnvironment.click();
  }

  async clickEditBaseEnvironment(): Promise<void> {
    await this.editBaseEnvironmentButton.click();
  }

  async closeManageEnvironments(): Promise<void> {
    await this.closeMangeEnvironmentsButton.click();
  }

  async selectGlobalEnvironment(): Promise<void> {
    await this.selectEnvironment.click();
  }

  async selectOption(name: string): Promise<void> {
    await this.page.getByRole('option', { name }).click();
  }

  async clickManageGlobalEnvironment(): Promise<void> {
    await this.manageGlobalEnvironment.click();
  }

  async clickImportFromUrl(): Promise<void> {
    await this.page.getByRole('button', { name: 'Import from URL' }).click();
  }

  async clickReflectiongRPC(): Promise<void> {
    await this.page.getByTestId('button-server-reflection').click();
  }

  async clickCommit(): Promise<void> {
    await this.page.getByRole('button', { name: 'Commit' }).click();
  }

  async selectMethod(option: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Select Method' }).click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async cancelRequest(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel Request' }).click();
  }

  async exportCollection(): Promise<void> {
    await this.page.getByTestId('workspace-context-dropdown').click();
    await this.page.getByRole('menuitemradio', { name: 'Export' }).click();
    await this.page.getByRole('button', { name: 'Export' }).click();
    await this.page.getByRole('combobox').click();
    // not finish the export flow since it will trigger the native file dialog which is hard to test, but we can at least verify the export button and dropdown are working as expected
  }

  async assertResponseBody(expected: string): Promise<void> {
    await expect.soft(this.responsePane).toContainText(expected, { timeout: 10000 });
  }

  async assertUrl(expected: string): Promise<void> {
    await expect.soft(this.responsePane).toContainText(expected);
  }
  getUrlInRequestPane(text: string): Locator {
    return this.page.getByTestId('request-pane').getByTestId('OneLineEditor').getByText(text);
  }

  async createInCollection(type: CreateInCollectionType, curl: string = ''): Promise<void> {
    await this.page.getByLabel('Create in collection').click();
    switch (type) {
      case 'New':
        await this.page.getByRole('menuitemradio', { name: 'New Folder' }).click();
        break;
      case 'HTTP':
        await this.page.getByRole('menuitemradio', { name: 'HTTP Request' }).click();
        break;
      case 'SSE':
        await this.page.getByRole('menuitemradio', { name: 'Event Stream Request (SSE)' }).click();
        break;
      case 'GraphQL':
        await this.page.getByRole('menuitemradio', { name: 'GraphQL Request' }).click();
        break;
      case 'gRPC':
        await this.page.getByRole('menuitemradio', { name: 'gRPC Request' }).click();
        break;
      case 'WebSocket':
        await this.page.getByRole('menuitemradio', { name: 'WebSocket Request' }).click();
        break;
      case 'Socket.IO':
        await this.page.getByRole('menuitemradio', { name: 'Socket.IO Request' }).click();
        break;
      case 'Curl':
        await this.page.getByRole('menuitemradio', { name: 'From Curl' }).click();
        await this.page.locator('.CodeMirror textarea').fill(curl);
        await this.page.getByRole('dialog').getByRole('button', { name: 'Import' }).click();
        break;
      case 'File':
        await this.page.getByRole('menuitemradio', { name: 'From File' }).click();
        // same function as import in dashboard, no need to finish this
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async selectPreview(type: PreviewType): Promise<void> {
    await this.page.getByTestId('response-pane').getByRole('toolbar').getByRole('button').first().click();
    switch (type) {
      case 'Visual':
        await this.page.getByRole('button', { name: 'Visual Preview' }).click();
        break;
      case 'Source':
        await this.page.getByRole('button', { name: 'Source Code' }).click();
        break;
      case 'Raw':
        await this.page.getByRole('button', { name: 'Raw Data' }).click();
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async selectRequestConfig(type: string): Promise<void> {
    await this.page.getByRole('tab', { name: type }).click();
  }

  async addStream(times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.page.locator('[data-testid="request-pane"] button:has-text("Stream")').click();
    }
  }

  async clearOauth2Session(): Promise<void> {
    await this.page.getByRole('button', { name: 'Clear OAuth 2 session' }).click();
  }

  async fillElectron(login: string, password: string, fun?: Promise<void>) {
    const [initialLoginPage] = await Promise.all([
      this.app.waitForEvent('window'),
      (await fun) || (await this.sendRequest()),
    ]);
    await initialLoginPage.waitForLoadState();
    await initialLoginPage.waitForFunction("document.cookie !== ''");
    await initialLoginPage.locator('[name="login"]').fill(login);
    await initialLoginPage.locator('[name="password"]').fill(password);
    await initialLoginPage.locator('button:has-text("Sign-in")').click();
  }

  async addCaCertificates(filePath: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Add Certificates' }).click();

    let fileChooser = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Add CA Certificate' }).click();
    await (await fileChooser).setFiles(filePath);

    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  async addClientCertificates(crt: string, key: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Add Certificates' }).click();
    await this.page.getByRole('button', { name: 'Add client certificate' }).click();
    await this.page.locator('[name="host"]').fill('localhost');

    let fileChooser = this.page.waitForEvent('filechooser');
    await this.page.locator('[data-test-id="add-client-certificate-file-chooser"]').click();
    await (await fileChooser).setFiles(crt);

    fileChooser = this.page.waitForEvent('filechooser');

    await this.page.locator('[data-test-id="add-client-certificate-key-file-chooser"]').click();
    await (await fileChooser).setFiles(key);

    await this.page.getByRole('dialog').getByRole('button', { name: 'Add certificate' }).click();
    await this.page.getByRole('button', { name: 'Done' }).click();
  }

  async addMockServer(name?: string): Promise<void> {
    await this.page.getByLabel('New Mock Server').click();
    name && (await this.page.getByRole('textbox', { name: 'Name' }).fill(name));
    // use default config instant
    await this.page.getByRole('button', { name: 'Create', exact: true }).click();
  }

  async clickServer(name: string): Promise<void> {
    await this.page.getByRole('button', { name: name }).click();
  }

  async selectTool(name: string): Promise<void> {
    const text = 'Tool' + name;
    await this.page.getByText(text).click();
  }

  async callTool(): Promise<void> {
    await this.page.getByRole('button', { name: 'Call Tool' }).click();
  }

  async connectMcpClient(mcp: string): Promise<void> {
    await this.page.locator('[data-testid="OneLineEditor"]').click();
    await this.page.waitForTimeout(1000);
    await this.page.locator('.CodeMirror textarea').fill(mcp);
    await this.page.waitForTimeout(1000);
    await this.Connect();
    await expect(this.page.getByText('Connected')).toBeInViewport();
  }
}
