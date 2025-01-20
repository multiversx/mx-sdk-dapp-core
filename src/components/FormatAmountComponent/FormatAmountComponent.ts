import { createUIElement } from 'utils/createUIElement';
import { FormatAmount } from 'lib/sdkDappCoreUi';
import {
  formatAmount,
  FormatAmountPropsType
} from 'utils/operations/formatAmount';
import { registerUIElement } from '../../utils/registerUIElement';
import { stringIsInteger } from '../../lib/sdkDappUtils';

interface FormatAmountComponentPropsType extends FormatAmountPropsType {
  egldLabel?: string;
}

export class FormatAmountComponent {
  private element: FormatAmount | null = null;

  constructor(private formatAmountId: string) {}

  async init() {
    this.element = await registerUIElement<FormatAmount>({
      name: 'format-amount',
      id: this.formatAmountId
    });
    
  }

  public async updateProps(props: FormatAmountPropsType) {
    const isValid = !stringIsInteger(props.input);
    const formattedValue = isValid ? formatAmount(props) : '';

    if (!this.element) {
      await this.init();
    }

    if (this.element) {
      this.element.updateData({isValid});
    }
  }

  public destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
