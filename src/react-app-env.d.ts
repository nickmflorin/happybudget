declare interface Window {
  analytics: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  Canny: any;
  Intercom: any;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly REACT_APP_PRODUCTION_ENV: "dev" | "app" | "local";
    readonly REACT_APP_SENTRY_DSN: string | undefined;
    readonly REACT_APP_AG_GRID_KEY: string | undefined;
    readonly REACT_APP_GOOGLE_CLIENT_KEY: string | undefined;
    readonly REACT_APP_API_DOMAIN: string;
    readonly REACT_APP_CANNY_FEEDBACK_URL: string | undefined;
  }
}
