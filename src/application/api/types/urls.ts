/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { enumeratedLiterals } from "lib/util/literals";
/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { EnumeratedLiteralType } from "lib/util/types/literals";

import { HttpMethod } from ".";

export type LeadingSlash<T extends string = string, ADD extends boolean = true> = T extends ""
  ? never
  : ADD extends true
  ? T extends `/${string}`
    ? T
    : `/${T}`
  : T extends `/${infer P}`
  ? LeadingSlash<P, false>
  : T;

export type TrailingSlash<T extends string = string, ADD extends boolean = true> = T extends ""
  ? never
  : ADD extends true
  ? T extends `${string}/`
    ? T
    : `${T}/`
  : T extends `${infer BASE extends `/${string}`}/`
  ? TrailingSlash<BASE, false>
  : T;

export type UrlPathParam = string | number;

export type UrlPathParamsObj<
  U extends string,
  P extends UrlPathParams<U> = UrlPathParams<U>,
> = Record<P[number] & string, UrlPathParam>;

type InvalidPathParamChar = "/" | ":" | "=" | "?" | "*" | "^" | "$" | " ";
type PathParamIsValid<P extends string> = P extends `${string}${InvalidPathParamChar}${string}`
  ? false
  : P extends ""
  ? false
  : true;

type InvalidPathParamMessage<P extends string> = `INVALID URL: PARAM '${P}' INVALID`;
type SafeguardPathParam<P extends string, R> = PathParamIsValid<P> extends true
  ? R
  : InvalidPathParamMessage<P>;

export type UrlPathParams<
  U extends string,
  PRE extends string[] = [],
> = U extends `${infer S extends string}/:${infer P extends string}/${infer D extends string}`
  ? SafeguardPathParam<P, UrlPathParams<`${S}/${D}`, [...PRE, P]>>
  : U extends `${infer S extends string}/:${infer P extends string}`
  ? SafeguardPathParam<P, UrlPathParams<S, [...PRE, P]>>
  : PRE;

export type UrlWithPathParams<
  U extends string,
  O extends UrlPathParamsObj<U, P>,
  P extends UrlPathParams<U> = UrlPathParams<U>,
> = U extends `${infer L extends string}/:${infer NAME extends keyof O &
  string}/${infer R extends string}`
  ? UrlWithPathParams<`${L}/${O[NAME]}/${R}`, O>
  : U extends `${infer L extends string}/:${infer NAME extends keyof O & string}`
  ? UrlWithPathParams<`${L}/${O[NAME]}`, O>
  : U;

export const HttpSchemes = enumeratedLiterals(["http", "https"] as const);
export type HttpScheme = EnumeratedLiteralType<typeof HttpSchemes>;

type InvalidHostChars = "/" | "?" | ":" | "@" | "&" | "=" | "+" | "$" | ",";

export type HttpHost<T extends string = string> = T extends `${string}${InvalidHostChars}${string}`
  ? never
  : T;

export type Port = `${number}`;

export type HttpDomain<
  S extends HttpScheme = HttpScheme,
  H extends string = string,
  P extends Port | undefined = undefined,
> = P extends undefined ? `${S}://${HttpHost<H>}` : `${HttpDomain<S, H>}:${P}`;

export type HttpPathOptions = {
  readonly path: string;
  readonly method?: HttpMethod;
  readonly basePath?: string;
};

export type HttpUriOptions = Partial<HttpPathOptions> & {
  readonly scheme: HttpScheme;
  readonly host: string;
  readonly port?: number;
};

type _OScheme<O extends Partial<HttpUriOptions>> = O extends {
  readonly scheme: infer S extends HttpScheme;
}
  ? S
  : HttpScheme;

type _OHost<O extends Partial<HttpUriOptions>> = O extends {
  readonly host: infer H extends string;
}
  ? H
  : string;

type _OPort<O extends Partial<HttpUriOptions>> = O extends { readonly port: infer P extends number }
  ? P
  : undefined;

type _OPath<O extends Partial<HttpPathOptions>> = O extends {
  readonly path: infer P extends string;
}
  ? P
  : string;

type _OMethod<O extends Partial<HttpPathOptions>> = O extends {
  readonly method: infer M extends HttpMethod;
}
  ? M
  : HttpMethod;

export type RequestPath<T extends string = string, M extends HttpMethod = HttpMethod> = {
  GET: TrailingSlash<LeadingSlash<T>, false> | TrailingSlash<LeadingSlash<T>>;
  POST: TrailingSlash<LeadingSlash<T>>;
  PATCH: TrailingSlash<LeadingSlash<T>>;
  DELETE: TrailingSlash<LeadingSlash<T>>;
}[M];

export type HttpPath<O extends Partial<HttpPathOptions> = Partial<HttpPathOptions>> = O extends {
  readonly basePath: infer B extends string;
}
  ? `${TrailingSlash<RequestPath<B, _OMethod<O>>, false>}/${LeadingSlash<
      RequestPath<_OPath<O>, _OMethod<O>>,
      false
    >}`
  : RequestPath<_OPath<O>, _OMethod<O>>;

export type HttpUri<O extends Partial<HttpUriOptions> = Partial<HttpUriOptions>> = `${HttpDomain<
  _OScheme<O>,
  _OHost<O>,
  _OPort<O>
>}`;

export type HttpPathUrl<O extends Partial<HttpPathOptions> = Partial<HttpPathOptions>> =
  | HttpPath<O>
  | `${HttpPath<O>}?${string}`;

export type HttpUrl<O extends Partial<HttpUriOptions> = Partial<HttpUriOptions>> =
  `${HttpUri<O>}${HttpPathUrl<O>}`;

export type ApiPath<T extends string = string, M extends HttpMethod = HttpMethod> = RequestPath<
  T extends `/v1/${infer V extends string}`
    ? `/v1/${LeadingSlash<V, false>}`
    : `/v1/${LeadingSlash<T, false>}`,
  M
>;
