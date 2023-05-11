import { mint } from './mint.js';

export async function handle(state, action) {
  const input = action.input;
  switch (input.function) {
    case 'mint':
      return mint(state, action);
    default:
      throw new ContractError(
        `No function supplied or function not recognized`
      );
  }
}
