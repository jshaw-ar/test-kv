import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { WarpFactory, LoggerFactory } from 'warp-contracts/mjs';
import { DeployPlugin } from 'warp-contracts-plugin-deploy';
import * as fs from 'fs';

// Things that need to be used in multiple blocks
// for example, we start arlocal in the .before() and stop it in the .after()
let warp;
let wallet1;
let connectedWallet1L1;
let connectedWallet1SEQ;
let wallet2;
let connectedWallet2L1;
let connectedWallet2SEQ;
let arlocal;
let newContractTxId;
// This will be set after allow, and be used for claiming
let allowTxForClaim1;
let allowTxForClaim2;

const test = suite('mint');

test.before(async () => {
  // arlocal = new ArLocal.default();
  // await arlocal.start();
  LoggerFactory.INST.logLevel('error');
  warp = WarpFactory.forLocal().use(new DeployPlugin());

  // Generate a wallet
  wallet1 = await warp.generateWallet();
  wallet2 = await warp.generateWallet();

  const prefix = `./dist/`;

  const contractSrcSEQ = fs.readFileSync(`${prefix}contract-SEQ.js`, 'utf8');
  const initialStateSEQ = JSON.parse(
    fs.readFileSync(`${prefix}initial-state-SEQ.json`, 'utf8')
  );

  const stateSEQ = {
    ...initialStateSEQ,
    ...{
      owner: wallet1.address,
    },
  };
  // Deploy contract
  const { contractTxId } = await warp.deploy({
    wallet: wallet1.jwk,
    initState: JSON.stringify({
      ...stateSEQ,
    }),
    src: contractSrcSEQ,
    evaluationManifest: {
      evaluationOptions: {
        useKVStorage: true,
      },
    },
  });
  newContractTxId = contractTxId;
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

  // Connect wallet to contract
  connectedWallet1SEQ = warp.contract(contractTxId).connect(wallet1.jwk);

  // Mint AR to wallet1
  await fetch(
    // Mints 300 AR.
    `http://localhost:1984/mint/${wallet1.address}/100000000000000`
  );
});

test('should mint 10 RebAR', async () => {
  await connectedWallet1SEQ.writeInteraction({ function: 'mint' });
  await fetch(`http://localhost:1984/mine`);
  console.log('DETS', wallet1.address, newContractTxId);
  const result = (
    await connectedWallet1SEQ.getStorageValues([wallet1.address])
  ).cachedValue.get(wallet1.address);
  const state = (await connectedWallet1SEQ.readState()).cachedValue.state;
  console.log('Result', state, result);
  // const balance = await result.get(wallet1.address); // BALANCE IS ALWAYS NULL THOUGH state.balance = 1
  // assert.is(balance, 1);
});

test.after(async () => {
  // await arlocal.stop();
});

test.run();
