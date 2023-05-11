export async function mint(state, action) {
  await SmartWeave.kv.put(action.caller, 1);
  const balance = await SmartWeave.kv.get(action.caller);
  console.log('BALANCE', balance);
  return { state: { ...state, balance: balance } }; // I CAN READ THE STATE AFTER AND SEE BALANCE IS THERE
}
