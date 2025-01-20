import { defineCustomElements } from 'lib/sdkDappCoreUi';
import { safeWindow } from '../constants';
import { CreateEventBusUIElementType } from './createUIElement';

interface RegisterUIElementParamsType {
  id: string;
  name: string;
}

export const registerUIElement = async <T = CreateEventBusUIElementType>({
  id,
  name
}: RegisterUIElementParamsType) => {
  await defineCustomElements(safeWindow);

  if (!safeWindow.document) {
    return {} as T;
  }

  const element = safeWindow.document.getElementById(id);
  await customElements.whenDefined(name);

  return element as T;
};
