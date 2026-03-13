import { expect } from '@playwright/test';
import { test } from '../../playwright/test';

test.describe('Design interactions', () => {
  test.slow(process.platform === 'darwin' || process.platform === 'win32', 'Slow app start on these platforms');

  test('Unit Test interactions', async ({ page, insomnia }) => {
    // Setup
    await insomnia.importFixture('unit-test.yaml');
    // Switch to Test tab
    await page.click('a:has-text("Test")');

    // Run tests and check results
    await page.getByLabel('Run all tests').click();
    await expect.soft(page.locator('.app')).toContainText('Request A is found');
    await expect.soft(page.locator('.app')).toContainText('Request B is not found');
    await expect.soft(page.locator('.app')).toContainText('Tests passed');

    // Create a new test suite
    await page.click('text=New test suite');

    // Rename test suite
    await page.getByRole('heading', { name: 'New Suite' }).locator('span').dblclick();
    await page.getByRole('textbox').fill('New Suite 2');
    await page.getByRole('textbox').press('Enter');

    // Add a new test
    await page.getByLabel('New test').click();

    // Rename test
    await page.getByLabel('Unit tests').getByRole('heading', { name: 'Returns' }).locator('div').dblclick();
    await page.getByLabel('Unit tests').getByRole('textbox').fill('Returns 200 and works');
    await page.getByLabel('Unit tests').getByRole('textbox').press('Enter');
    await page.getByLabel('Unit tests').getByText('Returns 200 and works').click();
    // Use autocomplete inside the test code
    // TODO(filipe) - add this in another PR
  });
});
