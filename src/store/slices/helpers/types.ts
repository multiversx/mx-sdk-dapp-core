export type GetSetType<T> = (
  partial: T | Partial<T> | ((state: T) => void),
  shouldReplace?: boolean | undefined,
  type?: {
    type: string;
  }
) => void;
