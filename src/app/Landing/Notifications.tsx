import { useState, useMemo } from "react";
import { isNil } from "lodash";

import * as api from "api";

import { Notification } from "components/feedback";

const EMAIL_CONFIRMATION_ERROR_MESSAGE = "There was an error verifying your email.";
const PASSWORD_RECOVERY_ERROR_MESSAGE = "There was an error resetting your password.";

/* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
const TOKEN_NOTIFICATION_TITLES: { [key in Http.TokenType]: string } = {
  "email-confirmation": EMAIL_CONFIRMATION_ERROR_MESSAGE,
  "password-recovery": PASSWORD_RECOVERY_ERROR_MESSAGE
};

const TOKEN_NOTIFICATION_MESSAGES: { [key in Http.TokenErrorCode]: string | ((userId: number | undefined) => string) } =
  {
    token_expired: (userId: number | undefined) =>
      !isNil(userId)
        ? "The previously created token has expired."
        : "The previously created token has expired. Please contact support.",
    token_not_valid: "The token is malformed or corrupted.  Please contact support."
  };

const TOKEN_NOTIFICATION_TYPES: { [key in Http.TokenErrorCode]: AlertType } = {
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

export const TokenNotification = (props: TokenNotificationProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const message = useMemo(() => {
    const msg = TOKEN_NOTIFICATION_MESSAGES[props.code];
    return typeof msg === "function" ? msg(props.userId) : msg;
  }, [props.userId]);

  const notificationLink = useMemo(() => {
    if (!isNil(props.userId) && props.tokenType === "email-confirmation") {
      return {
        loading,
        text: "Resend Email",
        onClick: () => {
          setLoading(true);
          api
            .verifyEmail(props.userId as number)
            .then(() => props.onSuccess?.())
            .catch((e: Error) => props.onError?.(e))
            .finally(() => setLoading(false));
        }
      };
    }
    return undefined;
  }, [props.userId, props.tokenType, loading]);

  return (
    <Notification
      type={TOKEN_NOTIFICATION_TYPES[props.code]}
      title={TOKEN_NOTIFICATION_TITLES[props.tokenType]}
      includeLink={notificationLink}
    >
      {message}
    </Notification>
  );
};

interface UnverifiedEmailNotificationProps {
  readonly userId: number | undefined;
  readonly message?: string;
  readonly title?: string;
  readonly type?: AlertType;
  readonly onError?: (e: Error) => void;
  readonly onSuccess?: () => void;
}

export const UnverifiedEmailNotification = (props: UnverifiedEmailNotificationProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const message = useMemo(() => {
    if (!isNil(props.message)) {
      return props.message;
    } else if (!isNil(props.userId)) {
      return "Your email address needs to be verified in order to login.";
    }
    return "Your email address needs to be verified in order to login. Please contact support.";
  }, [props.userId]);

  const notificationLink = useMemo(() => {
    if (!isNil(props.userId)) {
      return {
        loading,
        text: "Resend Email",
        onClick: () => {
          setLoading(true);
          api
            .verifyEmail(props.userId as number)
            .then(() => props.onSuccess?.())
            .catch((e: Error) => props.onError?.(e))
            .finally(() => setLoading(false));
        }
      };
    }
    return undefined;
  }, [props.userId, loading]);

  return (
    <Notification
      type={props.type || "warning"}
      title={props.title || "Your email address is not verified."}
      includeLink={notificationLink}
    >
      {message}
    </Notification>
  );
};

interface UserNotOnWaitlistNotificationProps {
  readonly title?: string;
  readonly type?: AlertType;
}

export const UserNotOnWaitlistNotification = (props: UserNotOnWaitlistNotificationProps): JSX.Element => {
  return (
    <Notification type={props.type || "warning"} title={props.title || "Your email is not on the waitlist."}>
      {`Currently, this software is open to those who are on the waitlist.  Please
			contact support if you would like more information.`}
    </Notification>
  );
};

interface UnapprovedUserNotificationProps {
  readonly title?: string;
  readonly type?: AlertType;
}

export const UnapprovedUserNotification = (props: UnapprovedUserNotificationProps): JSX.Element => {
  return (
    <Notification
      type={props.type || "warning"}
      title={props.title || "Your account has not been approved for access."}
    >
      {"Your account has been successfully verified, but has not yet been approved. Please contact support."}
    </Notification>
  );
};
