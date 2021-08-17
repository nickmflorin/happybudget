/// <reference path="./http.d.ts" />
/// <reference path="./redux.d.ts" />
/// <reference path="./ui.d.ts" />
/// <reference path="./table.d.ts" />
/// <reference path="./files.d.ts" />
/// <reference path="./modeling.d.ts" />
/// <reference path="./pdf.d.ts" />

interface Window {
  analytics: any;
}

type NonNullable<T> = Exclude<T, null | undefined>;

type SingleOrArray<T> = T | T[];

type NonNullRef<T> = {
  readonly current: T;
}
type SetUndefined<T, W extends keyof T> = Omit<T, W> & Record<W, undefined>;
type SetOptional<T, W extends keyof T> = Omit<T, W> & Partial<Pick<T, W>>;

// React's ComponentType and SimpleFunctionComponent force the use of { children: ReactNode },
// which doesn't always jive with what we are trying to do.
interface FunctionComponentWithoutChildren<P = {}> {
  (props: P, context?: any): import("react").ReactElement<any, any> | null;
  propTypes?: import("react").WeakValidationMap<P> | undefined;
  contextTypes?: import("react").ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

type RenderPropChild<PARAMS = any> = (p: PARAMS) => import("react").ReactElement<any, any>;

interface SimpleFunctionComponent<P = {}> {
  (props: P): import("react").ReactElement<any, any>;
}

// React's ComponentType and SimpleFunctionComponent force the use of { children: ReactNode },
// which can conflict with the use of render props.
interface FunctionComponentWithRenderPropChildren<P = {}, PARAMS = {}> {
  (props: P & { readonly children: RenderPropChild<PARAMS> }, context?: any): import("react").ReactElement<any, any> | null;
  propTypes?: import("react").WeakValidationMap<P> | undefined;
  contextTypes?: import("react").ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}