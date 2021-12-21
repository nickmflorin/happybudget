import { isNil } from "lodash";

import * as api from "api";

const EMAIL_CONFIRMATION_ERROR_MESSAGE = "There was an error verifying your email.";
const PASSWORD_RECOVERY_ERROR_MESSAGE = "There was an error resetting your password.";

const TOKEN_NOTIFICATION_MESSAGES: { [key in Http.TokenType]: string } = {
  "email-confirmation": EMAIL_CONFIRMATION_ERROR_MESSAGE,
  "password-recovery": PASSWORD_RECOVERY_ERROR_MESSAGE
};

const TOKEN_NOTIFICATION_DETAILS: { [key in Http.TokenErrorCode]: string | ((userId: number | undefined) => string) } =
  {
    token_expired: (userId: number | undefined) =>
      !isNil(userId)
        ? "The previously created token has expired."
        : "The previously created token has expired. Please contact support.",
    token_not_valid: "The token is malformed or corrupted.  Please contact support."
  };

const TOKEN_NOTIFICATION_TYPES: { [key in Http.TokenErrorCode]: AppNotificationLevel } = {
  token_expired: "warning",
  token_not_valid: "error"
};

interface TokenNotificationProps {
  readonly userId: number | undefined;
  readonly tokenType: Http.TokenType;
  readonly code: Http.TokenErrorCode;
  readonly onError?: (e: Error) => void;
  readonly onSuccess?: () => void;
}

export const TokenNotification = (props: TokenNotificationProps): UINotification => {
  const detail = TOKEN_NOTIFICATION_DETAILS[props.code];
  return {
    level: TOKEN_NOTIFICATION_TYPES[props.code],
    detail: typeof detail === "function" ? detail(props.userId) : detail,
    message: TOKEN_NOTIFICATION_MESSAGES[props.tokenType],

    includeLink:
      !isNil(props.userId) && props.tokenType === "email-confirmation"
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
  };
};

interface UnverifiedEmailNotificationProps {
  readonly userId: number | undefined;
  readonly message?: string;
  readonly detail?: string;
  readonly level?: AppNotificationLevel;
  readonly onError?: (e: Error) => void;
  readonly onSuccess?: () => void;
}

export const UnverifiedEmailNotification = (props: UnverifiedEmailNotificationProps): UINotification => ({
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

export const UserNotOnWaitlistNotification = (): UINotification => ({
  level: "warning",
  message: "Your email is not on the waitlist.",
  detail: `Currently, this software is open to those who are on the waitlist.  Please
	contact support if you would like more information.`
});

interface UnapprovedUserNotificationProps {
  readonly message?: string;
  readonly level?: AppNotificationLevel;
}

export const UnapprovedUserNotification = (props: UnapprovedUserNotificationProps): UINotification => ({
  level: props.level || "warning",
  message: props.message || "Your account has not been approved for access.",
  detail: "Your account has been successfully verified, but has not yet been approved. Please contact support."
});
