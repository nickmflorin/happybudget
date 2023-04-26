import type { AppProps as NextAppProps } from "next/app";

import * as api from "application/api";

export type AppProps = NextAppProps<{
  readonly statusCode?: typeof api.STATUS_CODES.HTTP_404_NOT_FOUND;
}>;
