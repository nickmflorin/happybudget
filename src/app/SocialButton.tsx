import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from "react-google-login";
import { isNil } from "lodash";
import { GoogleAuthButton } from "components/control/buttons";

interface SocialButtonProps {
  provider: "google";
  text: string;
  onGoogleSuccess: (tokenId: string) => void;
  // TODO: Come up with interface for Google structured error.
  onGoogleError: (error: any) => void;
}

const isOfflineResponse = (
  response: GoogleLoginResponse | GoogleLoginResponseOffline
): response is GoogleLoginResponseOffline => {
  return (
    (response as GoogleLoginResponseOffline).code !== undefined &&
    (response as GoogleLoginResponse).tokenId === undefined
  );
};

const SocialButton = ({ provider, text, onGoogleSuccess, onGoogleError }: SocialButtonProps): JSX.Element => {
  if (provider === "google") {
    return (
      <GoogleLogin
        clientId={!isNil(process.env.REACT_APP_GOOGLE_CLIENT_KEY) ? process.env.REACT_APP_GOOGLE_CLIENT_KEY : ""}
        render={(props: { onClick: () => void; disabled?: boolean }) => (
          <GoogleAuthButton text={text} onClick={props.onClick} disabled={props.disabled} />
        )}
        onSuccess={(response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
          // In the case that the response is GoogleLoginResponseOffline, the response
          // will just be { code: xxx } that can be used to obtain a refresh token
          // from the server.  This should be implemented at some point.
          if (isOfflineResponse(response)) {
            /* eslint-disable no-console */
            console.error(`Received offline response with code ${response.code}.`);
          } else {
            onGoogleSuccess(response.tokenId);
          }
        }}
        onFailure={(response: any) => onGoogleError(response)}
        cookiePolicy={"single_host_origin"}
      />
    );
  }
  return <></>;
};

export default SocialButton;
