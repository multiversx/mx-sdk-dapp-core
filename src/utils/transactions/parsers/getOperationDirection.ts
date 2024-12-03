import { TransactionDirectionEnum } from 'types';
import { OperationType } from '../../../types';

export function getOperationDirection({
  operation,
  address
}: {
  address: string;
  operation: OperationType;
}) {
  const directionOut = address === operation.sender;
  const directionIn = address === operation.receiver;
  const directionSelf = directionOut && directionIn;
  const directionInternal = !directionSelf;

  let direction = '';
  switch (true) {
    case directionOut:
      direction = TransactionDirectionEnum.OUT;
      break;
    case directionIn:
      direction = TransactionDirectionEnum.IN;
      break;
    case directionSelf:
      direction = TransactionDirectionEnum.SELF;
      break;
    case directionInternal:
      direction = TransactionDirectionEnum.INTERNAL;
      break;
  }

  return {
    direction
  };
}
