import { parseEnvVar } from "../../config";
import { HttpScheme } from "../types";

import { HttpClient } from "./HttpClient";

export * from "./HttpClient";
export * from "./types";

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

export const client = new HttpClient({
  host: API_HOST,
  basePath: "/v1",
  scheme: API_SCHEME.toLowerCase() as HttpScheme,
  port: API_PORT === null ? undefined : API_PORT,
});
