import { expect } from '@playwright/test';

import { loadFixture } from '../../playwright/paths';
import { test } from '../../playwright/test';

test('can chain multiple requests', async ({ app, insomnia }) => {
  const collectionPage = insomnia.collectionPage;
  await insomnia.importFixture('chained-responses.yaml');
  await collectionPage.selectCollection('third');

  await collectionPage.sendRequest();

  // third request will call second request which will call first request
  await collectionPage.assertResponseBody('first and second and third');
});
