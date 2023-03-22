declare global {
  /* eslint-disable-next-line no-unused-vars */
  const ROARR: import("roarr").RoarrGlobalState;

  interface Window {
    analytics:
      | {
          identify: (id: number, user: { name: string; email: string }) => void;
          page: () => void;
        }
      | undefined;
    Intercom: (
      e: "boot",
      data: {
        app_id: string;
        user_id: number;
        email: string;
        name: string;
        created_at: string;
        custom_launcher_selector: string;
      },
    ) => void;
    Canny: (
      e: "identify",
      data: {
        appID: string;
        user: {
          id: number;
          email: string;
          name: string;
          avatarURL: string | undefined;
          created: string;
        };
      },
    ) => void;
  }

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
