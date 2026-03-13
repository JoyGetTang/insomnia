import { expect } from '@playwright/test';

import { test } from '../../playwright/test';

const invalidNames = [
  { name: '', expectedError: 'Plugin name must not be empty or too long' },
  { name: 'foo bar', expectedError: 'Plugin name must be lowercase, alphanumeric, and dash-separated' },
  { name: 'foo;rm -rf /', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'foo&&ls', expectedError: 'Plugin name must not contain shell metacharacters' },
  { name: '$(echo hi)', expectedError: 'Plugin name must not contain shell metacharacters' },
  { name: '`ls`', expectedError: 'Plugin name must not contain shell metacharacters' },
  { name: '| ls', expectedError: 'Plugin name must not contain shell metacharacters' },
  { name: '../foo', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: '/etc/passwd', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'foo/../../bar', expectedError: 'Plugin name must not contain path traversal characters' },
  {
    name: '@scope//foo',
    expectedError:
      'Scoped packages are not permitted in this context. To install scoped packages, please use the Plugin Host instead.',
  },
  {
    name: '@scope foo',
    expectedError:
      'Scoped packages are not permitted in this context. To install scoped packages, please use the Plugin Host instead.',
  },
  {
    name: '@scope/foo/bar',
    expectedError:
      'Scoped packages are not permitted in this context. To install scoped packages, please use the Plugin Host instead.',
  },
  { name: 'foo\\bar', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'foo\nbar', expectedError: 'Plugin name must be lowercase, alphanumeric, and dash-separated' },
  { name: '\u0000foo', expectedError: 'Plugin name must be lowercase, alphanumeric, and dash-separated' },
  { name: 'foo🚀bar', expectedError: 'Plugin name must be lowercase, alphanumeric, and dash-separated' },
  { name: 'my--plugin', expectedError: 'Plugin name must not contain consecutive dashes' },
  { name: '-plugin', expectedError: 'Plugin name must not start with a dash' },
  { name: 'plugin-', expectedError: 'Plugin name must not end with a dash' },
  { name: '-', expectedError: 'Plugin name must not be a single dash' },
  { name: '.plugin', expectedError: 'Plugin name cannot start with a period' },
  { name: '_plugin', expectedError: 'Plugin name cannot start with an underscore' },
  { name: ' plugin ', expectedError: 'Plugin name cannot contain leading or trailing spaces' },
  { name: 'plugin@name', expectedError: 'Plugin name must be lowercase, alphanumeric, and dash-separated' },
  { name: '..\\plugin', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'plugin..', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'plugin..foo', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'plugin..foo..bar', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'plugin..foo/bar', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'plugin..foo\\bar', expectedError: 'Plugin name must not contain path traversal characters' },
  { name: 'plugin..foo/bar/baz', expectedError: 'Plugin name must not contain path traversal characters' },
  {
    name: 'insomnia-plugin-demo-example | bash -s 192.168.0.101 4242 |',
    expectedError: 'Plugin name must not contain shell metacharacters',
  },
];

test('Plugins', async ({ page, insomnia }) => {
  const preferences = insomnia.preferences;
  // Opening settings
  await insomnia.openPreferences();
  // Switching to Plugins tab
  await preferences.selectTab('Plugins');

  // Generate a new valid plugin
  const demoPluginName = 'demo-example';
  await preferences.clickNewPluginButton();
  await preferences.fillPluginName(demoPluginName);
  await preferences.clickGeneratePluginButton();
  await expect.soft(page.getByTestId(`insomnia-plugin-${demoPluginName}`)).toBeVisible();

  // Reject plugin name with consecutive dashes
  await preferences.clickNewPluginButton();

  for (const { name, expectedError } of invalidNames) {
    await preferences.fillPluginName(name);
    await preferences.clickGeneratePluginButton();

    await expect.soft(page.getByTestId('plugin-name-error')).toBeVisible();
    await expect.soft(page.getByTestId('plugin-name-error')).toHaveText(expectedError);
  }

  // Reject overly long plugin names
  const longName = 'a'.repeat(256);
  await preferences.fillPluginName(longName);
  await preferences.clickGeneratePluginButton();
  await expect.soft(page.getByTestId('plugin-name-error')).toBeVisible();
  await expect.soft(page.getByTestId('plugin-name-error')).toHaveText('Plugin name must not be empty or too long');

  // Prevent creating a plugin with a name that already exists
  const pluginName = 'duplicate-plugin';
  await preferences.fillPluginName(pluginName);
  await preferences.clickGeneratePluginButton();
  await expect.soft(page.getByTestId(`insomnia-plugin-${pluginName}`)).toBeVisible();

  // Try to generate the same plugin again
  await preferences.clickNewPluginButton();
  await preferences.fillPluginName(pluginName);
  await preferences.clickGeneratePluginButton();

  await expect.soft(page.getByTestId('plugin-name-error')).toBeVisible();
  await expect.soft(page.getByTestId('plugin-name-error')).toHaveText('Plugin already exists');
});
