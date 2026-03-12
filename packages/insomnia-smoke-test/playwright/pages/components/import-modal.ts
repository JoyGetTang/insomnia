import type { ElectronApplication, Locator, Page } from '@playwright/test';
import { loadFixture } from '../../paths';
import path from 'path';

/*
 * Component for the **ImportModalComponent*
 */
export class ImportModalComponent {
  scanButton: Locator;
  optionClipboard: Locator;
  confirmImportButton: Locator;
  optionFile: Locator;
  optionUrl: Locator;
  optionCurl: Locator;
  constructor(
    readonly page: Page,
    readonly app: ElectronApplication,
  ) {
    this.scanButton = this.page.getByRole('button', { name: 'Scan' });
    this.optionClipboard = this.page.locator('[data-test-id="import-from-clipboard"]');
    this.optionFile = this.page.locator('[data-test-id="import-from-file"]');
    this.optionUrl = this.page.locator('[data-test-id="import-from-uri"]');
    this.optionCurl = this.page.locator('[data-test-id="import-from-curl"]');
    this.confirmImportButton = this.page.getByRole('dialog').getByRole('button', { name: 'Import' });
  }

  async importFixtureByClipboard(fixturePath: string): Promise<void> {
    const text = await loadFixture(fixturePath);
    await this.app.evaluate(async ({ clipboard }, text) => clipboard.writeText(text), text);
    await this.optionClipboard.click();
    await this.scanButton.click();
    await this.confirmImportButton.click();
  }

  async importFixtureByFile(fileName: string): Promise<void> {
    await this.optionFile.click();
    const file_input = this.page.getByText('Choose Files');
    const filePath = path.join(__dirname, '../../../', 'fixtures', fileName);
    await file_input.setInputFiles(filePath);
    await this.scanButton.click();
    await this.confirmImportButton.click();
  }

  async importFixtureByUrl(url: string): Promise<void> {
    await this.optionUrl.click();
    await this.page.getByRole('textbox', { name: 'Url:' }).fill(url);
    await this.scanButton.click();
    await this.confirmImportButton.click();
  }

  async importFixtureByCurl(cUrl: string): Promise<void> {
    await this.optionCurl.click();
    await this.page.getByRole('textbox', { name: 'cURL:' }).fill(cUrl);
    await this.scanButton.click();
    await this.confirmImportButton.click();
  }
}
