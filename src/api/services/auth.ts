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

export const validateToken = async (): Promise<Http.TokenValidationResponse> => {
  const url = services.URL.v1("auth", "validate");
  return client.post<Http.TokenValidationResponse>(url);
};

export const validateEmailConfirmationToken = async (
  token: string,
  options?: Http.RequestOptions
): Promise<Http.TokenValidationResponse> => {
  const url = services.URL.v1("auth", "validate-email-confirmation-token");
  return client.post<Http.TokenValidationResponse>(url, { token }, options);
};

export const validatePasswordRecoveryToken = async (
  token: string,
  options?: Http.RequestOptions
): Promise<Http.TokenValidationResponse> => {
  const url = services.URL.v1("auth", "validate-password-recovery-token");
  return client.post<Http.TokenValidationResponse>(url, { token }, options);
};

export const sendEmailConfirmationEmail = async (id: number, options?: Http.RequestOptions): Promise<null> => {
  const url = services.URL.v1("auth", "send-verification-email");
  return client.post<null>(url, { user: id }, options);
};

export const sendForgotPasswordEmail = async (email: string, options?: Http.RequestOptions): Promise<null> => {
  const url = services.URL.v1("auth", "send-forgot-password-email");
  return client.post<null>(url, { email }, options);
};

export const resetPassword = async (
  payload: Http.ResetPasswordPayload,
  options?: Http.RequestOptions
): Promise<Model.User> => {
  const url = services.URL.v1("auth", "reset-password");
  return client.post<Model.User>(url, payload, options);
};
