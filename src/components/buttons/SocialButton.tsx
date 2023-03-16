import React from "react";

import { isNil } from "lodash";

import * as config from "config";

import { ButtonProps } from "./Button";

type SocialButtonProps = ButtonProps & {
  readonly provider: "google";
  readonly onGoogleSuccess: (tokenId: string) => void;
  // TODO: Come up with interface for Google structured error.
  readonly onGoogleError: (error: Record<string, unknown>) => void;
  readonly onGoogleScriptLoadFailure: (error: Record<string, unknown>) => void;
};

/* The package react-google-login is no longer maintained, and we will need to reimplement social
   authentication without it. */
const SocialButton = ({
  provider,
  onGoogleSuccess,
  onGoogleError,
  onGoogleScriptLoadFailure,
  ...props
}: SocialButtonProps): JSX.Element => {
  if (provider === "google") {
    /* This should be prevented since our environment does not allow for the
       case where SOCIAL_AUTHENTICATION_ENABLED is false and GOOGLE_CLIENT_KEY
       is not defined - and this button should not be shown if
       SOCIAL_AUTHENTICATION_ENABLED is false. */
    if (isNil(config.env.GOOGLE_CLIENT_KEY)) {
      return <></>;
    }
    return <></>;
    // return (
    //   <GoogleLogin
    //     clientId={config.env.GOOGLE_CLIENT_KEY}
    //     render={(p: { onClick: () => void; disabled?: boolean }) => (
    //       <GoogleAuthButton {...props} onClick={p.onClick} disabled={p.disabled} />
    //     )}
    //     onSuccess={(response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    //       /* In the case that the response is GoogleLoginResponseOffline, the
    // 				 response will just be { code: xxx } that can be used to obtain a
    // 				 refresh token from the server.  This should be implemented at some
    // 				 point. */
    //       if (isOfflineResponse(response)) {
    //         console.error(`Received offline response with code ${response.code}.`);
    //       } else {
    //         onGoogleSuccess(response.tokenId);
    //       }
    //     }}
    //     onFailure={(response: Record<string, unknown>) => onGoogleError(response)}
    //     onScriptLoadFailure={(error: Record<string, unknown>) => onGoogleScriptLoadFailure(error)}
    //     cookiePolicy={"single_host_origin"}
    //   />
    // );
  }
  console.warn(`Unsupported social login provider ${provider as string}.`);
  return <></>;
};

export default React.memo(SocialButton);
