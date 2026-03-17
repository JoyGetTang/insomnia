/*
 * Component for the **Document**
 * Common functions for operating folder/test
 */

import type { Locator, Page } from '@playwright/test';

export type ExampleOption = 'Pet Store' | 'Todo List' | 'Empty';
export type Workspace = 'Spec' | 'Collection' | 'Tests';

export class Document {
  constructor(readonly page: Page) {}

  async useExample(options: ExampleOption): Promise<void> {
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

  async togglePreview(): Promise<void> {
    await this.page.getByRole('button', { name: 'Toggle preview' }).click();
  }

  async clickAddTab(): Promise<void> {
    await this.page.getByRole('button', { name: 'Tab Plus' }).click();
  }

  async closeDocument(): Promise<void> {
    await this.page.getByTestId('tab-close-button').click();
  }

  async importUrl(url: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Import URL' }).click();
    await this.page.getByRole('textbox', { name: 'URL' }).fill(url);
    await this.page.getByRole('button', { name: 'Fetch and Import' }).click();
  }

  async switchWorkspace(workspace: Workspace): Promise<void> {
    switch (workspace) {
      case 'Spec':
        await this.page.getByTestId('workspace-spec').click();
        break;
      case 'Collection':
        await this.page.getByTestId('workspace-debug').click();
        break;
      case 'Tests':
        await this.page.getByTestId('workspace-test').click();
        break;
    }
  }

  async addNewTestsuite(): Promise<void> {
    await this.page.getByRole('button', { name: 'New test suite' }).click();
  }

  async addNewTest(option: string): Promise<void> {
    await this.page.getByRole('button', { name: 'New test', exact: true }).click();
    await this.page.getByRole('button', { name: 'Select a request' }).click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async runTest(): Promise<void> {
    await this.page.getByRole('button', { name: 'Run all tests' }).click();
  }
}
