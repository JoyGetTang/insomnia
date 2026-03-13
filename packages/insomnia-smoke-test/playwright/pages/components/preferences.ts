import type { Locator, Page } from '@playwright/test';

export class Preferences {
  constructor(readonly page: Page) {}

  async fillRequestTimeout(timeout: string): Promise<void> {
    await this.page.locator('[name="timeout"]').fill(timeout);
  }

  async selectTab(tabName: string): Promise<void> {
    switch (tabName) {
      case 'General':
        await this.page.getByRole('tab', { name: 'General' }).click();
        break;
      case 'Proxy':
        await this.page.getByRole('tab', { name: 'Proxy' }).click();
        break;
      case 'Data':
        await this.page.getByRole('tab', { name: 'Data' }).click();
        break;
      case 'Themes':
        await this.page.getByRole('tab', { name: 'Themes' }).click();
        break;
      case 'Keyboard':
        await this.page.getByRole('tab', { name: 'Keyboard' }).click();
        break;
      case 'Plugins':
        await this.page.getByRole('tab', { name: 'Plugins' }).click();
        break;
      case 'Credentials':
        await this.page.getByRole('tab', { name: 'Credentials' }).click();
        break;
      default:
        throw new Error(`Unknown tab name: ${tabName}`);
    }
  }

  async toggleEnableProxy(): Promise<void> {
    await this.page.locator('text=Enable proxy').click();
  }

  async fillHttpProxy(proxy: string): Promise<void> {
    await this.page.locator('[name="httpProxy"]').fill(proxy);
  }

  async fillHttpsProxy(proxy: string): Promise<void> {
    await this.page.locator('[name="httpsProxy"]').fill(proxy);
  }

  async fillNoProxy(noProxy: string): Promise<void> {
    await this.page.locator('[name="noProxy"]').fill(noProxy);
  }

  async close(): Promise<void> {
    await this.page.getByRole('button', { name: 'Modal Close Button' }).click();
  }

  async generatePlugin(pluginName: string): Promise<void> {
    await this.page.locator('text=New Plugin').click();
    await this.page.getByTestId('plugin-name-input').fill(pluginName);
    await this.page.getByTestId('generate-plugin-button').click();
  }

  async clickNewPluginButton(): Promise<void> {
    await this.page.locator('text=New Plugin').click();
  }

  async fillPluginName(pluginName: string): Promise<void> {
    await this.page.getByTestId('plugin-name-input').fill(pluginName);
  }

  async clickGeneratePluginButton(): Promise<void> {
    await this.page.getByTestId('generate-plugin-button').click();
  }

  // Reset the OAuth 2 session from Preferences
  async clearOAuthSession() {
    await this.page.getByTestId('settings-button').click();
    await this.page.locator('button:has-text("Clear OAuth 2 session")').click();
    await this.page.keyboard.press('Escape');
  }

  async addFolder(filePath: string) {
    await this.page.getByTestId('dataFolders').fill(filePath);
    await this.page.getByTestId('dataFolders-btn').click();
  }
}
