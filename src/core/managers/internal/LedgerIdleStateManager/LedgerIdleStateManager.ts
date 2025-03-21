import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { getStore } from 'store/store';

export class LedgerIdleStateManager {
  private static instance: LedgerIdleStateManager;
  private store = getStore();
  private interval: ReturnType<typeof setInterval> | null = null;

  public static getInstance(): LedgerIdleStateManager {
    if (!LedgerIdleStateManager.instance) {
      LedgerIdleStateManager.instance = new LedgerIdleStateManager();
    }
    return LedgerIdleStateManager.instance;
  }

  private constructor() {}

  public init = () => {
    this.store.subscribe(
      async ({ loginInfo: { providerType }, account: { address } }) => {
        if (providerType === ProviderTypeEnum.ledger && address) {
          console.log('\x1b[42m%s\x1b[0m', 'Ledger connected');
          this.checkConnection();
        } else {
          console.log('\x1b[41m%s\x1b[0m', 'Ledger disconnected');
          this.reset();
        }
      }
    );
  };

  private checkConnection = () => {
    if (this.interval) {
      return;
    }

    this.interval = setInterval(() => {
      console.log('test');
    }, 2000);
  };

  public reset = () => {
    if (!this.interval) {
      return;
    }

    clearInterval(this.interval);
    this.interval = null;
  };
}
