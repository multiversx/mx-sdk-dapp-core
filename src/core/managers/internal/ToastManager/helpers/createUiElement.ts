import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement as baseCreateUIElement } from 'utils/createUIElement';

/**
 * Creates a UI element with control over its initial visibility
 * This is shared between ToastManager and NotificationsFeedManager
 */
export const createUiElement = async <T extends HTMLElement>(
  name: string,
  isVisible: boolean = true
): Promise<T | null> => {
  try {
    const element = await baseCreateUIElement<T>({
      name
    });

    // Set initial visibility if needed
    if (!isVisible && element) {
      element.style.display = 'none';
    }

    return element;
  } catch (error) {
    console.error(`Error creating UI element '${name}':`, error);
    throw new Error(ProviderErrorsEnum.eventBusError);
  }
};
