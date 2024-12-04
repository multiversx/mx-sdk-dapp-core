import { TransactionTypesEnum } from 'types';
import { DecodeMethodEnum } from 'types/serverTransactions.types';
import { decodeByMethod } from './decodeByMethod';

interface SmartDecodedPartsType {
  parts: string[];
  decodedParts: string[];
  identifier?: string;
}

export function getSmartDecodedParts({
  parts,
  decodedParts,
  identifier
}: SmartDecodedPartsType) {
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
}
