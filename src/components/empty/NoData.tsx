import React, { ReactNode } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { PrimaryButton } from "components/buttons";

import "./NoData.scss";

interface NoDataProps extends StandardComponentProps {
  readonly children?: ReactNode;
  readonly title?: string;
  readonly subTitle?: string;
  readonly button?: { readonly onClick?: () => void; readonly text: string };
  readonly icon?: IconOrElement;
}

const NoData = ({ title, subTitle, button, icon, children, ...props }: NoDataProps): JSX.Element => (
  <div {...props} className={classNames("no-data", props.className)}>
    <div className={"no-data-content"}>
      {children}
      {!isNil(title) && <h1>{title}</h1>}
      {!isNil(subTitle) && <p>{subTitle}</p>}
      {!isNil(button) && (
        <PrimaryButton style={{ marginTop: 20 }} icon={icon} onClick={() => button.onClick?.()}>
          {button.text}
        </PrimaryButton>
      )}
    </div>
  </div>
);

export default React.memo(NoData);
