import { redirect } from './redirect';

export const safeRedirect = ({
  timeout = 0,
  url
}: {
  timeout?: number;
  url: string;
}) => {
  setTimeout(() => {
    return redirect(url);
  }, timeout);
};
