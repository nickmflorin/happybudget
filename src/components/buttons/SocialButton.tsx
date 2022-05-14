import React from "react";
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
import { isNil } from "lodash";

import * as config from "config";

import { ButtonProps } from "./Button";
import GoogleAuthButton from "./GoogleAuthButton";

type SocialButtonProps = ButtonProps & {
  readonly provider: "google";
  readonly onGoogleSuccess: (tokenId: string) => void;
  // TODO: Come up with interface for Google structured error.
  readonly onGoogleError: (error: Record<string, unknown>) => void;
  readonly onGoogleScriptLoadFailure: (error: Record<string, unknown>) => void;
};

const isOfflineResponse = (
  response: GoogleLoginResponse | GoogleLoginResponseOffline
): response is GoogleLoginResponseOffline => {
  return (
    (response as GoogleLoginResponseOffline).code !== undefined &&
    (response as GoogleLoginResponse).tokenId === undefined
  );
};

const SocialButton = ({
  provider,
  onGoogleSuccess,
  onGoogleError,
  onGoogleScriptLoadFailure,
  ...props
}: SocialButtonProps): JSX.Element => {
  if (provider === "google") {
    if (isNil(config.env.GOOGLE_CLIENT_KEY)) {
      console.warn("Cannot establish Google Login as `REACT_APP_GOOGLE_CLIENT_KEY` is not defined in environment.");
      return <></>;
    }
    return (
      <GoogleLogin
        clientId={config.env.GOOGLE_CLIENT_KEY}
        render={(p: { onClick: () => void; disabled?: boolean }) => (
          <GoogleAuthButton {...props} onClick={p.onClick} disabled={p.disabled} />
        )}
        onSuccess={(response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
          /* In the case that the response is GoogleLoginResponseOffline, the
						 response will just be { code: xxx } that can be used to obtain a
						 refresh token from the server.  This should be implemented at some
						 point. */
          if (isOfflineResponse(response)) {
            console.error(`Received offline response with code ${response.code}.`);
          } else {
            onGoogleSuccess(response.tokenId);
          }
        }}
        onFailure={(response: Record<string, unknown>) => onGoogleError(response)}
        onScriptLoadFailure={(error: Record<string, unknown>) => onGoogleScriptLoadFailure(error)}
        cookiePolicy={"single_host_origin"}
      />
    );
  }
  console.warn(`Unsupported social login provider ${provider as string}.`);
  return <></>;
};

export default React.memo(SocialButton);
