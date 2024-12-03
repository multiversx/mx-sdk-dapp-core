import { useEffect, useState, SetStateAction, Dispatch } from 'react';

import { DecodeMethodEnum } from 'types';
import { decodeTransactionData } from './decodeTransactionData';

export interface DataDecodeType {
  value: string;
  className?: string;
  initialDecodeMethod?: DecodeMethodEnum | string;
  setDecodeMethod?: Dispatch<SetStateAction<string>>;
  identifier?: string;
}

const decodeOptions = [
  {
    label: 'Raw',
    value: DecodeMethodEnum.raw
  },
  {
    label: 'Text',
    value: DecodeMethodEnum.text
  },
  {
    label: 'Decimal',
    value: DecodeMethodEnum.decimal
  },
  {
    label: 'Smart',
    value: DecodeMethodEnum.smart
  }
];

export function useDataDecode({
  value,
  initialDecodeMethod,
  setDecodeMethod,
  identifier
}: DataDecodeType) {
  const [activeKey, setActiveKey] = useState(
    initialDecodeMethod &&
      Object.values<string>(DecodeMethodEnum).includes(initialDecodeMethod)
      ? initialDecodeMethod
      : DecodeMethodEnum.raw
  );

  const { displayValue, validationWarnings } = decodeTransactionData({
    input: value,
    decodeMethod: activeKey as DecodeMethodEnum,
    identifier
  });

  useEffect(() => {
    if (setDecodeMethod) {
      setDecodeMethod(activeKey);
    }
  }, [activeKey]);

  return {
    displayValue,
    validationWarnings,
    setActiveKey,
    decodeOptions
  };
}
