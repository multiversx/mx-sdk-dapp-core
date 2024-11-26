import BigNumber from 'bignumber.js';
import { html, TemplateResult } from 'lit';
import { ILedgerAccount } from 'core/providers/helpers/ledger/ledger.types';

export function trimAddress(s: string): string {
  const firstFour = s.slice(0, 6);
  const lastFour = s.slice(-6);
  return `${firstFour}...${lastFour}`;
}

export function formatAmount(amount: string): string {
  const number = new BigNumber(amount);
  if (number.isNaN()) {
    return amount;
  }
  return number.dividedBy(BigNumber(10).pow(18)).toFormat(4).toString();
}

export function renderAccounts({
  shownAccounts = [],
  onSelectAccount,
  selectedIndex
}: {
  shownAccounts: ILedgerAccount[];
  onSelectAccount: (_index: number) => void;
  selectedIndex?: number;
}): TemplateResult {
  return html`
    <div class="account-header">
      <span>Address</span>
      <span>Balance</span>
      <span>#</span>
    </div>
    ${shownAccounts.map(
      (account) => html`
        <div class="account-row" @click=${() => onSelectAccount(account.index)}>
          <input
            type="radio"
            name="account"
            ?checked=${account.index === selectedIndex}
            value=${account.index}
          />
          <span class="address">${trimAddress(account.address)}</span>
          <span class="balance">${formatAmount(account.balance ?? '')}</span>
          <span class="index">${account.index}</span>
        </div>
      `
    )}
  `;
}
