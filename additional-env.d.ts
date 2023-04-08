declare module "*.ttf";
declare module "@editorjs/paragraph";
declare module "@editorjs/header";
declare module "@editorjs/table";
declare module "@editorjs/link";
declare module "@editorjs/list";
declare module "@fancyapps/ui/dist/fancybox.esm.js";
declare module "@ckeditor/ckeditor5-react" {
  import * as React from "react";

  import BalloonEditor from "@ckeditor/ckeditor5-build-balloon";
  import { EditorConfig } from "@ckeditor/ckeditor5-core/src/editor/editorconfig";
  import Event from "@ckeditor/ckeditor5-utils/src/eventinfo";

  type CKEditorProps = {
    disabled?: boolean;
    editor: typeof BalloonEditor;
    data?: string;
    id?: string;
    config?: EditorConfig;
    onReady?: (editor: BalloonEditor) => void;
    onChange?: (event: Event, editor: BalloonEditor) => void;
    onBlur?: (event: Event, editor: BalloonEditor) => void;
    onFocus?: (event: Event, editor: BalloonEditor) => void;
    onError?: (event: Event, editor: BalloonEditor) => void;
  };
  const CKEditor: React.FunctionComponent<CKEditorProps>;
  export { CKEditor, CKEditorProps, Event as CKEditorEvent, BalloonEditor as EditorInstance };
}

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

  declare type NonNullRef<T> = {
    readonly current: T;
  };

  interface ProcessEnv {
    readonly NODE_ENV: "development" | "production" | "test";
    /**
     * Defines the Plaid environment.  Options are:
     *
     * 1. sandbox
     * 2. prod
     *
     * For Plaid, we are only concerned with whether or not we are using the Sandbox mode, because
     * the behavior in regard to generating link tokens is not applicable for Sandbox mode.  The
     * default value of this ENV variable will be "prod", even when the ENV variable is not
     * specified, unless "sandbox" is specified in the env file.
     */
    readonly NEXT_PUBLIC_PLAID_ENV: string | undefined;
    /**
     * Distinguishes between different production servers.  Options are:
     *
     * 1. local
     * 2. dev
     * 3. app
     */
    readonly NEXT_PUBLIC_PRODUCTION_ENV: string | undefined;

    readonly NEXT_PUBLIC_APP_DOMAIN: string | undefined;
    readonly NEXT_PUBLIC_API_PORT: string | undefined;
    readonly NEXT_PUBLIC_API_HOST: string | undefined;
    readonly NEXT_PUBLIC_API_SCHEME: string | undefined;
    readonly NEXT_PUBLIC_CSRF_TOKEN_NAME: string | undefined;
    readonly NEXT_PUBLIC_TERMS_AND_CONDITIONS_URL: string | undefined;

    readonly NEXT_PUBLIC_SENTRY_DSN: string | undefined;
    readonly NEXT_PUBLIC_SENTRY_ERROR_DATA_DEPTH: string | undefined;
    readonly NEXT_PUBLIC_SENTRY_NORMALIZE_DEPTH: string | undefined;
    readonly NEXT_PUBLIC_SENTRY_ENV: string | undefined;

    readonly NEXT_PUBLIC_AG_GRID_KEY: string | undefined;
    readonly NEXT_PUBLIC_TABLE_DEBUG: string | undefined;

    readonly NEXT_PUBLIC_PRO_FONT_AWESOME: string | undefined;

    readonly ROARR_LOG: string | undefined;
    readonly NEXT_PUBLIC_ROARR_BROWSER_LOG: string | undefined;

    readonly NEXT_PUBLIC_INTERCOM_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_INTERCOM_SUPPORT_URL: string | undefined;
    readonly NEXT_PUBLIC_INTERCOM_APP_ID: string | undefined;

    readonly NEXT_PUBLIC_CANNY_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_CANNY_FEEDBACK_URL: string | undefined;
    readonly NEXT_PUBLIC_CANNY_APP_ID: string | undefined;

    readonly NEXT_PUBLIC_WHY_DID_YOU_RENDER: string | undefined;
    readonly NEXT_PUBLIC_SEGMENT_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_PLAID_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_BILLING_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_SOCIAL_AUTHENTICATION_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_COLLABORATION_ENABLED: string | undefined;

    readonly NEXT_PUBLIC_EMAIL_ENABLED: string | undefined;
    readonly NEXT_PUBLIC_EMAIL_VERIFICATION_ENABLED: string | undefined;

    readonly NEXT_PUBLIC_SWR_ERROR_RETRY_INTERVAL: string | undefined;
    readonly NEXT_PUBLIC_SWR_ERROR_RETRY_COUNT: string | undefined;
    readonly NEXT_PUBLIC_SWR_DEDUPING_INTERVAL: string | undefined;
    readonly NEXT_PUBLIC_SWR_RETRY_ON_ERROR: string | undefined;
    readonly NEXT_PUBLIC_SWR_RETRY_ON_NETWORK_ERROR: string | undefined;
    readonly NEXT_PUBLIC_SWR_REVALIDATE_ON_RECONNECT: string | undefined;
    readonly NEXT_PUBLIC_SWR_KEEP_PREVIOUS_DATA: string | undefined;
    readonly NEXT_PUBLIC_SWR_REVALIDATE_ON_FOCUS: string | undefined;
    readonly NEXT_PUBLIC_SWR_REVALIDATE_ON_MOUNT: string | undefined;
  }
}

export {};
