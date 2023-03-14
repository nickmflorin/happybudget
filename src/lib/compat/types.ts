import type { AppProps as NextAppProps } from "next/app";

import { http } from "lib";

export type AppProps = NextAppProps<{
  readonly statusCode?: typeof http.STATUS_CODES.HTTP_404_NOT_FOUND;
}>;
