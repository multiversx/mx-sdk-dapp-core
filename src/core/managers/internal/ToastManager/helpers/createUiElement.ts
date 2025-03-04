import { SdkDappCoreUiTagsEnum } from 'constants/sdkDappCoreUiTags';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement as baseCreateUIElement } from 'utils/createUIElement';

export const createUiElement = async <T extends HTMLElement>(
  name: SdkDappCoreUiTagsEnum,
  isVisible: boolean = true
): Promise<T | null> => {
  try {
    const element = await baseCreateUIElement<T>({
      name
    });

    if (!isVisible && element) {
      element.style.display = 'none';
    }

    return element;
  } catch (error) {
    console.error(`Error creating UI element '${name}':`, error);
    throw new Error(ProviderErrorsEnum.eventBusError);
  }
};
