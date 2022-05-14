import { includes } from "lodash";
import { Environments } from "./constants";
import * as config from "./config";

export const ACCCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
export const MAX_IMAGE_SIZE = 2; // In MB

export const ENV = config.Config<Application.Environment>({
  nodeSourceName: "REACT_APP_PRODUCTION_ENV",
  validators: [(v: string) => includes(Environments.__ALL__, v)],
  defaultValue: "local"
});

export const environmentIsProd = () => !includes(Environments.__NON_PROD__, ENV);

export const environmentIsNotProd = () => includes(Environments.__NON_PROD__, ENV);

export const environmentIsLocal = () => ENV === Environments.LOCAL;

export const environmentIsRemote = () => includes(Environments.__REMOTE__, ENV);

export const API_DOMAIN = config.Config<string>({
  nodeSourceName: "REACT_APP_API_DOMAIN",
  validators: [(v: string) => v.startsWith("http://") || v.startsWith("https://"), (v: string) => !v.endsWith("/")],
  defaultValue: {
    local: "http://local.happybudget.io:8000",
    dev: "https://devapi.happybudget.io",
    app: "https://api.happybudget.io"
  }
});

export const APP_DOMAIN = config.Config<string>({
  nodeSourceName: "REACT_APP_DOMAIN",
  validators: [(v: string) => v.startsWith("http://") || v.startsWith("https://")],
  defaultValue: {
    local: "http://local.happybudget.io:3000",
    dev: "https://dev.happybudget.io",
    app: "https://app.happybudget.io"
  }
});

export const BILLING_ENABLED = config.BooleanConfig({
  nodeSourceName: "REACT_APP_BILLING_ENABLED",
  defaultValue: false
});

export const COLLABORATION_ENABLED = config.BooleanConfig({
  nodeSourceName: "REACT_APP_COLLABORATION_ENABLED",
  defaultValue: {
    local: true,
    dev: true,
    app: false
  }
});

export const EMAIL_ENABLED = config.BooleanConfig({
  nodeSourceName: "REACT_APP_EMAIL_ENABLED",
  defaultValue: false
});

export const EMAIL_VERIFICATION_ENABLED = config.BooleanConfig({
  nodeSourceName: "REACT_APP_EMAIL_VERIFICATION_ENABLED",
  defaultValue: false
});

export const TABLE_DEBUG = config.BooleanConfig({
  nodeSourceName: "REACT_APP_TABLE_DEBUG",
  memorySourceName: "tableDebug",
  defaultValue: false
});

export const REPORT_WEB_VITALS = config.BooleanConfig({
  nodeSourceName: "REACT_APP_REPORT_WEB_VITALS",
  memorySourceName: "reportWebVitals",
  defaultValue: false
});

export const WHY_DID_YOU_RENDER = config.BooleanConfig({
  nodeSourceName: "REACT_APP_WHY_DID_YOU_RENDER",
  memorySourceName: "whyDidYouRender",
  defaultValue: false
});

export const SOCIAL_AUTHENTICATION_ENABLED = config.BooleanConfig({
  nodeSourceName: "REACT_APP_SOCIAL_AUTHENTICATION_ENABLED",
  defaultValue: true
});

export const GOOGLE_CLIENT_KEY = config.Config<string, string | undefined>({
  nodeSourceName: "REACT_APP_GOOGLE_CLIENT_KEY",
  required: false
});

export const CANNY_FEEDBACK_URL = config.Config<string, string | undefined>({
  nodeSourceName: "REACT_APP_CANNY_FEEDBACK_URL",
  required: false
});

export const CANNY_APP_ID = config.Config<string, string | undefined>({
  nodeSourceName: "REACT_APP_CANNY_APP_ID",
  required: false,
  warning: {
    app: () => console.warn("Will not be able to identify users with Canny as REACT_APP_CANNY_APP_ID is not defined.")
  }
});

export const INTERCOM_SUPPORT_URL = config.Config<string, string | undefined>({
  nodeSourceName: "REACT_APP_INTERCOM_SUPPORT_URL",
  required: false
});

export const INTERCOM_APP_ID = config.Config<string, string | undefined>({
  nodeSourceName: "REACT_APP_INTERCOM_APP_ID",
  required: false,
  warning: {
    app: () =>
      console.warn("Will not be able to identify users with Intercom as REACT_APP_INTERCOM_APP_ID is not defined.")
  }
});

export const TERMS_AND_CONDITIONS_URL = config.Config<string, string | undefined>({
  nodeSourceName: "REACT_APP_TERMS_AND_CONDITIONS_URL",
  required: false
});

export const AG_GRID_KEY = config.Config<string, string | undefined>({
  nodeSourceName: "REACT_APP_AG_GRID_KEY",
  required: false,
  warning: () => console.warn("No REACT_APP_AG_GRID_KEY found in environment.  App may not behave as expected.")
});

export const SENTRY_DSN = config.Config<string, string | undefined>({
  nodeSourceName: "REACT_APP_SENTRY_DSN",
  required: {
    local: false,
    dev: true,
    app: true
  }
});

export const SENTRY_ENV = config.Config<"development" | "production">({
  nodeSourceName: "REACT_APP_SENTRY_ENV",
  defaultValue: {
    local: "development", // This doesn't matter since it is not used.
    app: "production",
    dev: "development"
  }
});

export const SEGMENT_ENABLED = environmentIsProd();
