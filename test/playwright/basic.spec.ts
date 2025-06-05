import { testWithSynpress } from '@synthetixio/synpress';
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright';
import basicSetup from '../wallet-setup/basic.setup';

const test = testWithSynpress(metaMaskFixtures(basicSetup))

const { expect } = test

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle("TSender");
});

test('Show formt only when connected', async({ page, context, metamaskPage, extensionId }) => {
  await page.goto("/")
  await expect(page.getByText("Please Connect")).toBeVisible();

  const metamask = new MetaMask(context, metamaskPage, basicSetup.walletPassword, extensionId);

  await page.getByTestId("rk-connect-button").click();
  await page.getByTestId("rk-wallet-option-io.metamask").waitFor({
    state: 'visible',
    timeout: 30000
  });
  await page.getByTestId("rk-wallet-option-io.metamask").click()
  await metamask.connectToDapp()

  // const customNetwork = {
  //   name: "Anvil",
  //   rpcUrl: "http:/127.0.0.1:8545",
  //   chainId: 31337,
  //   symbol: "ETH"
  // }

  // await metamask.addNetwork(customNetwork)

  await expect(page.getByText("Recipients")).toBeVisible()
})

