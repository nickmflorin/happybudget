import Cookies from "universal-cookie";

import { parseEnvVar } from "../config";

import { HttpClient } from "./HttpClient";
import * as types from "./types";

const API_HOST = parseEnvVar(process.env.NEXT_PUBLIC_API_HOST, "NEXT_PUBLIC_API_HOST", {
  required: true,
});
const API_SCHEME = parseEnvVar(process.env.NEXT_PUBLIC_API_SCHEME, "NEXT_PUBLIC_API_SCHEME", {
  required: true,
});
if (!["http", "https"].includes(API_SCHEME.toLowerCase())) {
  throw new TypeError("Expected 'NEXT_PUBLIC_API_SCHEME' to be 'http' or 'https'!");
}
const API_PORT = parseEnvVar(process.env.NEXT_PUBLIC_API_PORT, "NEXT_PUBLIC_API_PORT", {
  type: "number",
});

const CSRF_TOKEN_NAME = parseEnvVar(
  process.env.NEXT_PUBLIC_CSRF_TOKEN_NAME,
  "NEXT_PUBLIC_CSRF_TOKEN_NAME",
  {
    required: true,
  },
);

export const getRequestHeaders = (): Record<string, string> => {
  const cookies = new Cookies();
  const csrfToken = cookies.get(CSRF_TOKEN_NAME);
  if (csrfToken !== null && csrfToken !== undefined) {
    return { "X-CSRFToken": csrfToken };
  }
  return {};
};

export const client = new HttpClient({
  host: API_HOST,
  basePath: "/v1",
  scheme: API_SCHEME.toLowerCase() as types.HttpScheme,
  port: API_PORT === null ? undefined : API_PORT,
  credentials: "include",
  headers: getRequestHeaders,
  deserializeResponseBodyOnError: (response: Response) => response.status < 500,
});
