import { Address } from '@multiversx/sdk-core';
import BigNumber from 'bignumber.js';
import { TransactionTypesEnum } from 'types/enums.types';
import {
  DecodeMethodEnum,
  TransactionTokensType,
  DecodedDisplayType
} from 'types/serverTransactions.types';
import { isUtf8 } from 'utils/decoders';
import { isHexValidCharacters, isHexValidLength } from 'utils/validation';
import { addressIsValid } from 'utils/validation/addressIsValid';

interface GetDecodedPartsPropsType {
  parts: string[];
  decodeMethod: DecodeMethodEnum;
  identifier?: string;
  decodedData: DecodedDisplayType;
}

interface SmartDecodedPartsType {
  parts: string[];
  decodedParts: string[];
  identifier?: string;
}

const getHexValidationWarnings = (str: string) => {
  const warnings = [];

  if (str && !isHexValidCharacters(str)) {
    warnings.push(`Invalid Hex characters on argument @${str}`);
  }

  if (str && !isHexValidLength(str)) {
    warnings.push(`Odd number of Hex characters on argument @${str}`);
  }

  return warnings;
};

const decodeByMethod = (
  part: string,
  decodeMethod: DecodeMethodEnum | string,
  transactionTokens?: TransactionTokensType
) => {
  switch (decodeMethod) {
    case DecodeMethodEnum.text:
      try {
        return Buffer.from(part, 'hex').toString('utf8');
      } catch {
        //TODO
      }

      return part;
    case DecodeMethodEnum.decimal:
      return part !== '' ? new BigNumber(part, 16).toString(10) : '';
    case DecodeMethodEnum.smart:
      try {
        const bech32Encoded = Address.fromHex(part).toString();

        if (addressIsValid(bech32Encoded)) {
          return bech32Encoded;
        }
      } catch {
        //TODO
      }

      try {
        const decoded = Buffer.from(part, 'hex').toString('utf8');

        if (!isUtf8(decoded)) {
          if (transactionTokens) {
            const tokens = [
              ...transactionTokens.esdts,
              ...transactionTokens.nfts
            ];

            if (tokens.some((token) => decoded.includes(token))) {
              return decoded;
            }
          }

          const bn = new BigNumber(part, 16);

          return bn.isFinite() ? bn.toString(10) : part;
        } else {
          return decoded;
        }
      } catch {
        //TODO
      }

      return part;
    case DecodeMethodEnum.raw:
    default:
      return part;
  }
};

const getSmartDecodedParts = ({
  parts,
  decodedParts,
  identifier
}: SmartDecodedPartsType) => {
  const updatedParts = [...decodedParts];

  if (parts[0] === TransactionTypesEnum.ESDTNFTTransfer && parts[2]) {
    updatedParts[2] = decodeByMethod(parts[2], DecodeMethodEnum.decimal);
  }

  if (identifier === TransactionTypesEnum.ESDTNFTTransfer && parts[1]) {
    const base64Buffer = Buffer.from(String(parts[1]), 'base64');
    updatedParts[1] = decodeByMethod(
      base64Buffer.toString('hex'),
      DecodeMethodEnum.decimal
    );
  }

  return updatedParts;
};

const getDisplayValueAndValidationWarnings = ({
  parts,
  decodeMethod,
  identifier,
  decodedData
}: GetDecodedPartsPropsType) => {
  const initialDecodedParts = parts.map((part, index) => {
    if (
      parts.length >= 2 &&
      ((index === 0 && part.length < 64) || (index === 1 && !parts[0]))
    ) {
      const encodedDisplayValue = /[^a-z0-9]/gi.test(part);
      if (encodedDisplayValue) {
        return decodeByMethod(part, decodeMethod);
      }

      return part;
    }

    const hexValidationWarnings = getHexValidationWarnings(part);

    if (hexValidationWarnings?.length) {
      decodedData.validationWarnings = Array.from(
        new Set([...decodedData.validationWarnings, ...hexValidationWarnings])
      );
    }

    return decodeByMethod(part, decodeMethod);
  });

  const decodedParts =
    decodeMethod === DecodeMethodEnum.smart
      ? getSmartDecodedParts({
          parts,
          decodedParts: initialDecodedParts,
          identifier
        })
      : initialDecodedParts;

  return decodedParts;
};

const decodeDataField = ({
  data,
  identifier,
  decodeMethod
}: {
  data: string;
  identifier?: string;
  decodeMethod: DecodeMethodEnum;
}) => {
  const decodedData: DecodedDisplayType = {
    displayValue: '',
    validationWarnings: []
  };

  if (!data.includes('@') && !data.includes('\n')) {
    decodedData.displayValue = decodeByMethod(data, decodeMethod);

    return decodedData;
  }

  if (data.includes('@')) {
    const parts = data.split('@');
    const decodedParts = getDisplayValueAndValidationWarnings({
      parts,
      decodeMethod,
      identifier,
      decodedData
    });

    decodedData.displayValue = decodedParts.join('@');
  }

  if (data.includes('\n')) {
    const parts = data.split('\n');
    const initialDecodedParts = parts.map((part) => {
      const base64Buffer = Buffer.from(part, 'base64');

      if (decodeMethod === DecodeMethodEnum.raw) {
        return part;
      }

      return decodeByMethod(base64Buffer.toString('hex'), decodeMethod);
    });

    const decodedParts =
      decodeMethod === DecodeMethodEnum.smart
        ? getSmartDecodedParts({
            parts,
            decodedParts: initialDecodedParts,
            identifier
          })
        : initialDecodedParts;

    decodedData.displayValue = decodedParts.join('\n');
  }

  return decodedData;
};

export const getAllDecodedFormats = ({
  data,
  identifier
}: {
  data: string;
  identifier?: string;
}) => {
  const decodedFormats: Partial<Record<DecodeMethodEnum, DecodedDisplayType>> =
    {};

  Object.values(DecodeMethodEnum).forEach((method) => {
    const result = decodeDataField({ data, identifier, decodeMethod: method });
    decodedFormats[method] = result;
  });

  return decodedFormats;
};
