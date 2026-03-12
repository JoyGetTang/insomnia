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

  async exportCollection(): Promise<void> {
    await this.page.getByTestId('workspace-context-dropdown').click();
    await this.page.getByRole('menuitemradio', { name: 'Export' }).click();
    await this.page.getByRole('button', { name: 'Export' }).click();
    await this.page.getByRole('combobox').click();
    // not finish the export flow since it will trigger the native file dialog which is hard to test, but we can at least verify the export button and dropdown are working as expected
  }
}
