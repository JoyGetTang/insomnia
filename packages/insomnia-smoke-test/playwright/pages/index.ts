import { expect, type ElectronApplication, type Locator, type Page } from '@playwright/test';

import { StatusbarComponent } from './components/statusbar';
import { CollectionPage } from './components/collection';
import { ImportModalComponent } from './components/import-modal';
import { Preferences } from './components/preferences';
import { Documents } from './components/documents';

/**
 * Root facade for the Insomnia E2E Page Object Model.
 *
 * ```ts
 * test('example test', async ({ insomnia }) => {
 *  // Project operations
 *  await insomnia.projectPage.importFixture('simple.yaml');
 *
 *  // Shared components (statusbar is always present)
 *  await insomnia.statusbar.openPreferences();
 * });
 * ```
 *
 * ## Architecture
 *
 * ```
 * InsomniaApp (root)
 * ├── .statusbar     -> StatusbarComponent (convenience shortcut)
 * └── .projectPage     -> ProjectPage
 *     ├── .sidebar      -> ProjectSidebarComponent
 *     └── .workspaceList -> WorkspaceListComponent
 * ```
 */
export class InsomniaApp {
  // ===========================================================================
  // Shared components (layout level)
  // ===========================================================================

  /** Statusbar (footer) — always visible. */
  readonly statusbar: StatusbarComponent;

  // ===========================================================================
  // Page objects
  // ===========================================================================

  /** Project page (project/file list). */
  collectionPage: CollectionPage;
  importModalComponent: ImportModalComponent;
  preferences: Preferences;
  documents: Documents;

  constructor(
    readonly page: Page,
    readonly app: ElectronApplication,
  ) {
    // Shared components
    this.statusbar = new StatusbarComponent(page);

    // Pages
    this.importModalComponent = new ImportModalComponent(page, app);
    this.collectionPage = new CollectionPage(page, app);
    this.preferences = new Preferences(page);
    this.documents = new Documents(page);
  }

  // ===========================================================================
  // Global utilities
  // ===========================================================================

  /** Press Escape on the app container (closes modals, dropdowns, overlays). */

  get root() {
    return this.page.locator('.app');
  }

  async pressEscape(): Promise<void> {
    await this.page.locator('.app').press('Escape');
  }

  async openPreferences() {
    await this.root.getByTestId('settings-button').click();
  }

  async importFixture(fixture: string, type: string = 'clipboard'): Promise<void> {
    // set clipboard as default
    await this.root.getByLabel('Import').click();
    switch (type) {
      case 'clipboard':
        await this.importModalComponent.importFixtureByClipboard(fixture);
        break;
      case 'file':
        await this.importModalComponent.importFixtureByFile(fixture);
        break;
      case 'url':
        await this.importModalComponent.importFixtureByUrl(fixture);
        break;
      case 'cURL':
        await this.importModalComponent.importFixtureByCurl(fixture);
        break;
      default:
        throw new Error(`Unsupported import type: ${type}`);
    }
  }

  async clickBody(): Promise<void> {
    await this.page.locator('body').click();
  }

  async createDocument(name?: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Create document' }).click();
    name && (await this.page.getByRole('textbox', { name: 'Name' }).fill(name));
    await this.page.getByRole('button', { name: 'Create', exact: true }).click();
  }

  async inviteUser(user: string) {
    await this.page.getByLabel('Invite collaborators').click();
    // await this.page.getByPlaceholder('Enter emails, separated by').click();
    await this.page.getByPlaceholder('Enter emails, separated by').fill(user);
    await this.page.getByRole('button', { name: 'Invite', exact: true }).click();
  }

  workspaceLocator(name: string): Locator {
    return this.page.getByTestId('workspace-grid').getByLabel(name);
  }

  async openWorkspace(name: string): Promise<void> {
    await this.page.getByTestId('workspace-grid').getByLabel(name).click();
  }
}
