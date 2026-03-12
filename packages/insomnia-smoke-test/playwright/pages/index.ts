import { expect, type ElectronApplication, type Locator, type Page } from '@playwright/test';

import { StatusbarComponent } from './components/statusbar';
import { ProjectPage } from './project';
import { CollectionPage } from './components/collection';
import { ImportModalComponent } from './components/import-modal';

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
  readonly projectPage: ProjectPage;
  collectionPage: CollectionPage;
  importModalComponent: ImportModalComponent;

  constructor(
    readonly page: Page,
    readonly app: ElectronApplication,
  ) {
    // Shared components
    this.statusbar = new StatusbarComponent(page);

    // Pages
    this.projectPage = new ProjectPage(page, app);
    this.importModalComponent = new ImportModalComponent(page, app);
    this.collectionPage = new CollectionPage(page, app);
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

  async importFixture(type: string, fixture: string): Promise<void> {
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
      case 'curl':
        await this.importModalComponent.importFixtureByCurl(fixture);
        break;
      default:
        throw new Error(`Unsupported import type: ${type}`);
    }
  }

  async clickBody(): Promise<void> {
    await this.page.locator('body').click();
  }
}
