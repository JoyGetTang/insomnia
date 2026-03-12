import { expect, type ElectronApplication, type Locator, type Page } from '@playwright/test';

import { loadFixture } from '../../paths';
import { WorkspaceListComponent } from './workspace-list';
import { ImportModalComponent } from '../components/import-modal';
import { CollectionPage } from '../components/collection';

/**
 * Page Object for the **project page** (file list view).
 *
 * Visible at route: `/organization/:orgId/project/:projectId`
 *
 * Composes shared layout components and project-specific components:
 * - TopNavBar, Statusbar, NavBar, TabBar (layout)
 * - Sidebar, Toolbar, WorkspaceList (project-specific)
 */
export class ProjectPage {
  /** The workspace list (files). */
  readonly workspaceList: WorkspaceListComponent;

  constructor(
    readonly page: Page,
    readonly app: ElectronApplication,
  ) {
    this.workspaceList = new WorkspaceListComponent(page);
  }

  /** The root app container. */

  // ===========================================================================
  // Import (ONLY available on project page)
  // ===========================================================================

  /**
   * Import a fixture file from clipboard.
   * This is the most common operation in tests.
   */
}
