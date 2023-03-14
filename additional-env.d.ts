declare global {
  /* eslint-disable-next-line no-unused-vars */
  const ROARR: import("roarr").RoarrGlobalState;
}

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
    /* For Plaid, we are only concerned with whether or not we are using the Sandbox mode, because
       the behavior in regard to generating link tokens is not applicable for Sandbox mode.  The
       default value of this ENV variable will be "prod", even when the ENV variable is not
       specified, unless "sandbox" is specified in the env file. */
    readonly NEXT_PUBLIC_PLAID_ENV: "sandbox" | "prod" | undefined;
    /* This environment variable allows us to distinguish between dev and production remote servers,
       and local development. */
    readonly NEXT_PUBLIC_PRODUCTION_ENV: "dev" | "app" | "local" | undefined;
    readonly SENTRY_DSN: string | undefined;
    readonly AG_GRID_KEY: string | undefined;
    readonly GOOGLE_CLIENT_KEY: string | undefined;
    readonly NEXT_PUBLIC_API_DOMAIN: string;
    readonly NEXT_PUBLIC_APP_DOMAIN: string;
    readonly NEXT_PUBLIC_BILLING_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_EMAIL_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_CANNY_FEEDBACK_URL: string | undefined;
    readonly NEXT_PUBLIC_INTERCOM_SUPPORT_URL: string | undefined;
  }
}

export {};
