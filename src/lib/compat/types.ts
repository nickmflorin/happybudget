import type { AppProps as NextAppProps } from "next/app";

import { api } from "application";

export type AppProps = NextAppProps<{
  readonly statusCode?: typeof api.STATUS_CODES.HTTP_404_NOT_FOUND;
}>;
