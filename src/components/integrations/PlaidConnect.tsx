import React, { useEffect } from "react";
import { usePlaidLink, PlaidLinkOptions } from "react-plaid-link";

interface PlaidConnectProps {
  readonly token: string;
  readonly setPlaidPublicToken: React.Dispatch<React.SetStateAction<string>>;
  readonly updatePlaidModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
}

// TODO: Turn into a hook
const PlaidConnect = (props: PlaidConnectProps): JSX.Element => {
  const config: PlaidLinkOptions = {
    onSuccess: public_token => {
      props.setPlaidPublicToken(public_token);
      props.updatePlaidModalVisibility(true);
    },
    token: props.token
  };

  const { open, ready } = usePlaidLink(config);

  useEffect(() => {
    if (props.token !== "" && ready) {
      open();
    }
  });

  return <></>;
};

export default PlaidConnect;
