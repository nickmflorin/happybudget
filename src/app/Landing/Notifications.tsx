import { isNil } from "lodash";

import * as api from "api";

const EMAIL_CONFIRMATION_ERROR_MESSAGE = "There was an error verifying your email.";
const PASSWORD_RECOVERY_ERROR_MESSAGE = "There was an error resetting your password.";

const TOKEN_NOTIFICATION_MESSAGES: { [key in Http.TokenType]: string } = {
  "email-confirmation": EMAIL_CONFIRMATION_ERROR_MESSAGE,
  "password-recovery": PASSWORD_RECOVERY_ERROR_MESSAGE
};

const TOKEN_NOTIFICATION_TYPES: { [key in Http.TokenErrorCode]: AppNotificationLevel } = {
  token_expired: "warning",
  token_not_valid: "error"
};

export type UITokenNotificationRedirectData = {
  readonly userId: number | undefined;
  readonly tokenType: Http.TokenType;
  readonly code: Http.TokenErrorCode;
};

interface TokenNotificationProps {
  readonly tokenType: Http.TokenType;
  readonly code: Http.TokenErrorCode;
  readonly detail: string;
  readonly includeLink?: UINotificationData["includeLink"];
}

export const TokenNotification = (props: TokenNotificationProps): UINotificationData => ({
  level: TOKEN_NOTIFICATION_TYPES[props.code],
  detail: props.detail,
  message: TOKEN_NOTIFICATION_MESSAGES[props.tokenType],
  includeLink: props.includeLink
});

export const TokenInvalidNotification = (
  props: Omit<TokenNotificationProps, "code" | "detail" | "includeLink">
): UINotificationData => {
  return TokenNotification({
    ...props,
    code: "token_expired",
    detail: "The token is malformed or corrupted.  Please contact support."
  });
};

export const EmailTokenInvalidNotification = (): UINotificationData => {
  return TokenInvalidNotification({
    tokenType: "email-confirmation"
  });
};

export const PasswordTokenInvalidNotification = (): UINotificationData => {
  return TokenInvalidNotification({
    tokenType: "password-recovery"
  });
};

export const TokenExpiredNotification = ({
  userId,
  ...props
}: Omit<TokenNotificationProps, "code" | "detail"> & {
  readonly userId: number | undefined;
}): UINotificationData => {
  return TokenNotification({
    ...props,
    code: "token_expired",
    detail: !isNil(userId)
      ? "The previously created token has expired."
      : "The previously created token has expired. Please contact support."
  });
};

export const PasswordTokenExpiredNotification = (): UINotificationData => {
  return TokenExpiredNotification({
    userId: undefined,
    tokenType: "password-recovery"
  });
};

export const EmailTokenExpiredNotification = ({
  onError,
  onSuccess,
  ...props
}: Omit<TokenNotificationProps, "tokenType" | "includeLink" | "code" | "detail"> & {
  readonly onError?: (e: Error) => void;
  readonly onSuccess?: () => void;
  readonly userId: number | undefined;
}): UINotificationData => {
  return TokenExpiredNotification({
    ...props,
    tokenType: "email-confirmation",
    includeLink: !isNil(props.userId)
      ? ({ setLoading }) => ({
          text: "Resend Email",
          onClick: () => {
            setLoading(true);
            api
              .verifyEmail(props.userId as number)
              .then(() => onSuccess?.())
              .catch((e: Error) => onError?.(e))
              .finally(() => setLoading(false));
          }
        })
      : undefined
  });
};

interface UnverifiedEmailNotificationProps {
  readonly userId: number | undefined;
  readonly message?: string;
  readonly detail?: string;
  readonly level?: AppNotificationLevel;
  readonly onError?: (e: Error) => void;
  readonly onSuccess?: () => void;
}

export const UnverifiedEmailNotification = (props: UnverifiedEmailNotificationProps): UINotificationData => ({
  level: "warning",
  message: props.message,
  detail: !isNil(props.detail)
    ? props.detail
    : !isNil(props.userId)
    ? "Your email address needs to be verified in order to login."
    : "Your email address needs to be verified in order to login. Please contact support.",
  includeLink: !isNil(props.userId)
    ? ({ setLoading }) => ({
        text: "Resend Email",
        onClick: () => {
          setLoading(true);
          api
            .verifyEmail(props.userId as number)
            .then(() => props.onSuccess?.())
            .catch((e: Error) => props.onError?.(e))
            .finally(() => setLoading(false));
        }
      })
    : undefined
});

export const UserNotOnWaitlistNotification = (): UINotificationData => ({
  level: "warning",
  message: "Your email is not on the waitlist.",
  detail: `Currently, this software is open to those who are on the waitlist.  Please
	contact support if you would like more information.`
});
