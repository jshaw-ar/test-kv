import { WarpFactory } from 'warp-contracts/mjs';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';

async function run() {
  const warp = WarpFactory.forLocal().use(new DeployPlugin());
  const wallet1 = await warp.generateWallet();
  const connected = warp
    .contract('vayNEFow2Lp0sN-83FH1y4HO6QNaXcdddPgblP5_LV4')
    .connect(wallet1.jwk);
  const state = (await connected.readState()).cachedValue.state;
  const result = (
    await connected.getStorageValues([
      'UZYvUR_KwriSyWHWcKOiNI70i4I6Qr6arV4CqgeGE_E',
    ])
  ).cachedValue.get('UZYvUR_KwriSyWHWcKOiNI70i4I6Qr6arV4CqgeGE_E');

  console.log('Result', result);
}

run().catch(console.log);
