import { enumeratedLiteralsMap, EnumeratedLiteralType } from "../util";

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

export type JsonValue =
  | JsonObject
  | JsonValue[]
  | boolean
  | number
  | string
  | readonly JsonValue[]
  | null;

export type JsonObject = {
  [k: string]: JsonValue;
};

export type ClientPath<T extends string = string> = TrailingSlash<LeadingSlash<T>, false>;

export const HttpMethods = enumeratedLiteralsMap(["GET", "POST", "PATCH", "DELETE"] as const);
export type HttpMethod = EnumeratedLiteralType<typeof HttpMethods>;

export type QueryParamValue = string | number | boolean;
export type RawQuery = Record<string, QueryParamValue | undefined | null>;
export type ProcessedQuery = Record<string, QueryParamValue>;

export type Payload = JsonObject;

export enum STATUS_CODES {
  HTTP_200_OK = 200,
  HTTP_201_OK = 201,
  HTTP_204_OK = 204,
  HTTP_400_BAD_REQUEST = 400,
  HTTP_401_UNAUTHORIZED = 401,
  HTTP_403_FORBIDDEN = 403,
  HTTP_404_NOT_FOUND = 404,
  HTTP_405_METHOD_NOT_ALLOWED = 405,
  HTTP_500_INTERNAL_SERVER_ERROR = 500,
}

export type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES];
