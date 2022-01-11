import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import ButtonLink from "./ButtonLink";

const IncludeButtonLink = (props: StandardComponentProps & { readonly includeLink: IncludeLink }): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const linkObj: LinkObj =
    typeof props.includeLink === "function" ? props.includeLink({ setLoading, history }) : props.includeLink;
  return (
    <ButtonLink
      {...props}
      loading={loading}
      style={{ marginLeft: 6 }}
      onClick={() => {
        if (!isNil(linkObj.to)) {
          history.push(linkObj.to);
        } else {
          linkObj.onClick?.();
        }
      }}
    >
      {linkObj.text}
    </ButtonLink>
  );
};

export default React.memo(IncludeButtonLink);
