/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly PUBLIC_URL: string;
  }
}

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
    const src: string;
    export default src;
}

declare module '*.svg' {
  import * as React from 'react';

  export const ReactComponent: React.FunctionComponent<React.SVGProps<
    SVGSVGElement
  > & { title?: string }>;

  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
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
    readonly REACT_APP_PRODUCTION_ENV: "dev" | "app" | "local";
    readonly REACT_APP_SENTRY_DSN: string | undefined;
    readonly REACT_APP_AG_GRID_KEY: string | undefined;
    readonly REACT_APP_GOOGLE_CLIENT_KEY: string | undefined;
    readonly REACT_APP_API_DOMAIN: string;
    readonly REACT_APP_CANNY_FEEDBACK_URL: string | undefined;
    readonly REACT_APP_INTERCOM_SUPPORT_URL: string | undefined;
  }
}
