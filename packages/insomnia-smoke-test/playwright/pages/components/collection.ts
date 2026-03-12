import type { ElectronApplication, Locator, Page } from '@playwright/test';

/*
 * Component for the **Collection page**
 */
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

  async sendRequest(): Promise<void> {
    await this.page.getByTestId('request-pane').getByRole('button', { name: 'Send' }).click();
  }

  async Connect(isConnected: boolean): Promise<void> {
    isConnected
      ? await this.page.getByTestId('request-pane').getByRole('button', { name: 'Connect' }).click()
      : await this.page.getByTestId('request-pane').getByRole('button', { name: 'Disconnect' }).click();
  }

  async clickTestsTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Tests' }).click();
  }

  async clickConsoleTab(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Console' }).click();
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

  getUrlInRequestPane(text: string): Locator {
    return this.page.getByTestId('request-pane').getByTestId('OneLineEditor').getByText(text);
  }

  async createInCollection(type: string, curl: string = ''): Promise<void> {
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

  async selectPreview(type: string): Promise<void> {
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
}
