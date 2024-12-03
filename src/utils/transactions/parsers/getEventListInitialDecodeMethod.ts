import { DecodeMethodEnum } from 'types';
import { getWindowLocation } from 'utils/window/getWindowLocation';

export function getEventListInitialDecodeMethod() {
  const { hash } = getWindowLocation();
  const hashValues = hash.split('/');
  const initialDecodeMethod = hashValues[2] ?? DecodeMethodEnum.raw;
  return initialDecodeMethod;
}
