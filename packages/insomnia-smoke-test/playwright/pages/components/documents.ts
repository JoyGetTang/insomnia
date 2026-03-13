import type { Locator, Page } from '@playwright/test';

export class Documents {
  constructor(readonly page: Page) {}

  async useExample(options: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Start from a sample' }).click();
    switch (options) {
      case 'Pet Store':
        await this.page.getByRole('menuitemradio', { name: 'Pet Store' }).click();
        break;
      case 'Todo List':
        await this.page.getByRole('menuitemradio', { name: 'Todo List' }).click();
        break;
      case 'Empty':
        await this.page.getByRole('menuitemradio', { name: 'Empty' }).click();
        break;
      default:
        throw new Error(`Unknown example option: ${options}`);
    }
  }

  async clickNoLintProblems(): Promise<void> {
    await this.page.getByText('No lint problems').click();
  }
}
