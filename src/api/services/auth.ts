import { client } from "api";
import * as services from "./services";

export const login = async (email: string, password: string, options?: Http.RequestOptions): Promise<Model.User> => {
  const url = services.URL.v1("auth", "login");
  return client.post<Model.User>(url, { email, password }, options);
};

export const socialLogin = async (payload: Http.SocialPayload, options?: Http.RequestOptions): Promise<Model.User> => {
  const url = services.URL.v1("auth", "social-login");
  return client.post<Model.User>(url, payload, options);
};

export const logout = async (): Promise<null> => {
  const url = services.URL.v1("auth", "logout");
  return client.post<null>(url);
};

export const validateAuthToken = async (
  payload?: Http.AuthTokenValidationPayload,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = services.URL.v1("auth", "validate");
  return client.post<Model.User>(url, payload || {}, options);
};

export const validateEmailConfirmationToken = async (
  token: string,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = services.URL.v1("auth", "validate-email-verification-token");
  return client.post<Model.User>(url, { token }, options);
};

export const validatePasswordRecoveryToken = async (
  token: string,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = services.URL.v1("auth", "validate-password-recovery-token");
  return client.post<Model.User>(url, { token }, options);
};

export const verifyEmail = async (id: number, options?: Http.RequestOptions): Promise<null> => {
  const url = services.URL.v1("auth", "verify-email");
  return client.post<null>(url, { user: id }, options);
};

export const recoverPassword = async (email: string, options?: Http.RequestOptions): Promise<null> => {
  const url = services.URL.v1("auth", "recover-password");
  return client.post<null>(url, { email }, options);
};

export const resetPassword = async (
  payload: Http.ResetPasswordPayload,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = services.URL.v1("auth", "reset-password");
  return client.post<Model.User>(url, payload, options);
};
