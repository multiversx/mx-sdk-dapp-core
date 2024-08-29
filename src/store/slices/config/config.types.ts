import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';

export interface ConfigSliceType {
  nativeAuthConfig: NativeAuthConfigType | null;
}
