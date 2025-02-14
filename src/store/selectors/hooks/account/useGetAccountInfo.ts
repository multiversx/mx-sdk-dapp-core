import { accountInfoSelector } from 'store/selectors/accountSelectors';
import { useSelector } from '../useSelector';

export const useGetAccountInfo = () => {
  return useSelector(accountInfoSelector);
};
