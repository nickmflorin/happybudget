import { client } from "api";

export const login = async (
  email: string,
  password: string,
  options?: Http.IRequestOptions
): Promise<Http.ILoginResponse> => {
  options = { ...options, redirectOnAuthenticationError: false };
  return client.post<Http.ILoginResponse>("/v1/auth/login", { email, password }, options);
};

export const socialLogin = async (
  payload: Http.ISocialPayload,
  options?: Http.IRequestOptions
): Promise<Http.ILoginResponse> => {
  options = { ...options, redirectOnAuthenticationError: false };
  return client.post<Http.ILoginResponse>("/v1/auth/social-login", payload, options);
};

export const logout = async (): Promise<null> => {
  return client.post<null>("/v1/auth/logout");
};

export const validateToken = async (): Promise<Http.ITokenValidationResponse> => {
  return client.post<Http.ITokenValidationResponse>("/v1/jwt/validate");
};
