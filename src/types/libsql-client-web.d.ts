declare module '@libsql/client/web' {
  import type { createClient as baseCreateClient } from '@libsql/client';

  export const createClient: typeof baseCreateClient;
}
