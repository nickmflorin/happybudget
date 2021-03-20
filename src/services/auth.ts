import { client, unauthenticatedClient } from "api";
import { URL } from "./util";

export const login = async (
  email: string,
  password: string,
  options?: Http.IRequestOptions
): Promise<Http.ILoginResponse> => {
  options = { ...options, redirectOnAuthenticationError: false };
  const url = URL.v1("auth", "login");
  return unauthenticatedClient.post<Http.ILoginResponse>(url, { email, password }, options);
};

export const socialLogin = async (
  payload: Http.ISocialPayload,
  options?: Http.IRequestOptions
): Promise<Http.ILoginResponse> => {
  options = { ...options, redirectOnAuthenticationError: false };
  const url = URL.v1("auth", "social-login");
  return unauthenticatedClient.post<Http.ILoginResponse>(url, payload, options);
};

export const logout = async (): Promise<null> => {
  const url = URL.v1("auth", "logout");
  return unauthenticatedClient.post<null>(url);
};

export const validateToken = async (): Promise<Http.ITokenValidationResponse> => {
  const url = URL.v1("jwt", "validate");
  return client.post<Http.ITokenValidationResponse>(url);
};
