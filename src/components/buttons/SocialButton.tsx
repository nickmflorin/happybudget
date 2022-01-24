import { ReactNode } from "react";
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
import { isNil } from "lodash";
import { GoogleAuthButton } from "components/buttons";

interface SocialButtonProps {
  readonly provider: "google";
  readonly children: ReactNode;
  readonly onGoogleSuccess: (tokenId: string) => void;
  // TODO: Come up with interface for Google structured error.
  readonly onGoogleError: (error: Record<string, unknown>) => void;
  readonly onGoogleScriptLoadFailure: (error: Record<string, unknown>) => void;
}

const isOfflineResponse = (
  response: GoogleLoginResponse | GoogleLoginResponseOffline
): response is GoogleLoginResponseOffline => {
  return (
    (response as GoogleLoginResponseOffline).code !== undefined &&
    (response as GoogleLoginResponse).tokenId === undefined
  );
};

const SocialButton = (props: SocialButtonProps): JSX.Element => {
  if (props.provider === "google") {
    if (isNil(process.env.REACT_APP_GOOGLE_CLIENT_KEY)) {
      console.warn("Cannot establish Google Login as `REACT_APP_GOOGLE_CLIENT_KEY` is not defined in environment.");
      return <></>;
    }
    return (
      <GoogleLogin
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_KEY}
        render={(p: { onClick: () => void; disabled?: boolean }) => (
          <GoogleAuthButton onClick={p.onClick} disabled={p.disabled}>
            {props.children}
          </GoogleAuthButton>
        )}
        onSuccess={(response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
          /* In the case that the response is GoogleLoginResponseOffline, the
						 response will just be { code: xxx } that can be used to obtain a
						 refresh token from the server.  This should be implemented at some
						 point. */
          if (isOfflineResponse(response)) {
            console.error(`Received offline response with code ${response.code}.`);
          } else {
            props.onGoogleSuccess(response.tokenId);
          }
        }}
        onFailure={(response: Record<string, unknown>) => props.onGoogleError(response)}
        onScriptLoadFailure={(error: Record<string, unknown>) => props.onGoogleScriptLoadFailure(error)}
        cookiePolicy={"single_host_origin"}
      />
    );
  }
  console.warn(`Unsupported social login provider ${props.provider}.`);
  return <></>;
};

export default SocialButton;
