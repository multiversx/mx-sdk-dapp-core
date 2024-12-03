import { GuardianActionsEnum } from 'types';

export function isGuardianTx({
  data,
  onlySetGuardian
}: {
  data?: string;
  onlySetGuardian?: boolean;
}) {
  if (!data) {
    return false;
  }

  if (onlySetGuardian) {
    return data.startsWith(GuardianActionsEnum.SetGuardian);
  }

  return Object.values(GuardianActionsEnum).some((action) =>
    data.startsWith(action)
  );
}
