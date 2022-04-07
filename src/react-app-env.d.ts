declare interface Window {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  analytics: any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  Canny: any;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  Intercom: any;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    /* For Plaid, we are only concerned with whether or not we are using the
       Sandbox mode, because the behavior in regard to generating link tokens
       is not applicable for Sandbox mode.  The default value of this ENV
       variable will be "prod", even when the ENV variable is not specified,
       unless "sandbox" is specified in the env file. */
    readonly REACT_APP_PLAID_ENV?: "sandbox" | "prod";
    readonly REACT_APP_PRODUCTION_ENV: "dev" | "app" | "local";
    readonly REACT_APP_SENTRY_DSN: string | undefined;
    readonly REACT_APP_AG_GRID_KEY: string | undefined;
    readonly REACT_APP_GOOGLE_CLIENT_KEY: string | undefined;
    readonly REACT_APP_API_DOMAIN: string;
    readonly REACT_APP_DOMAIN: string;
    readonly REACT_APP_CANNY_FEEDBACK_URL: string | undefined;
    readonly REACT_APP_INTERCOM_SUPPORT_URL: string | undefined;
  }
}
