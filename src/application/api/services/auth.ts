import { model } from "lib";

import { client } from "../client";
import * as types from "../types";

export const login = async (
  email: string,
  password: string,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<model.User>> =>
  client.post<model.User>("/auth/login/", {
    ...options,
    credentials: "omit",
    body: { email, password },
  });

export const socialLogin = async (
  body: types.SocialPayload,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<model.User>> =>
  client.post<model.User>("/auth/social-login/", {
    ...options,
    credentials: "omit",
    body,
  });

export const logout = async (
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<null>> => client.post<null>("/auth/logout/", options);

export const validateAuthToken = async (
  payload?: types.AuthTokenValidationPayload,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<model.User>> =>
  client.post<model.User>("/auth/validate/", { ...options, body: payload });

export const validatePublicToken = async (
  payload?: types.PublicTokenValidationPayload,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<{ readonly token_id: string }>> =>
  client.post<{ readonly token_id: string }>("/auth/validate-public/", {
    ...options,
    body: payload,
  });

export const validateEmailConfirmationToken = async (
  token: string,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<model.User>> =>
  client.post<model.User>("/auth/validate-email-verification-token/", {
    ...options,
    credentials: "omit",
    body: { token },
  });

export const validatePasswordRecoveryToken = async (
  token: string,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<model.User>> =>
  client.post<model.User>("/auth/validate-password-recovery-token/", {
    ...options,
    credentials: "omit",
    body: { token },
  });

export const verifyEmail = async (
  id: number,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<null>> =>
  client.post<null>("/auth/verify-email/", {
    ...options,
    credentials: "omit",
    body: { user: id },
  });

export const recoverPassword = async (
  email: string,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<null>> =>
  client.post<null>("/auth/recover-password/", {
    ...options,
    credentials: "omit",
    body: { email },
  });

export const resetPassword = async (
  payload: types.ResetPasswordPayload,
  options?: Omit<types.ClientRequestOptions, "credentials" | "body">,
): Promise<types.ClientResponse<model.User>> =>
  client.post<model.User>("/auth/reset-password/", {
    ...options,
    credentials: "omit",
    body: payload,
  });

export const updatePublicToken = client.createParameterizedPatchService<
  "/auth/public-tokens/:id/",
  model.PublicToken,
  types.PublicTokenPayload
>("/auth/public-tokens/:id/");

export const deletePublicToken =
  client.createParameterizedDeleteService<"/auth/public-tokens/:id/">("/auth/public-tokens/:id/");

export const getPublicToken = client.createParameterizedRetrieveService<
  "/auth/public-tokens/:id/",
  model.PublicToken
>("/auth/public-tokens/:id/");
