import React, { ReactNode } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { PrimaryButton } from "components/buttons";

export type NoDataProps = StandardComponentProps & {
  readonly title?: string;
  readonly subTitle?: string;
  readonly button?: { readonly onClick?: () => void; readonly text: string };
  readonly icon?: IconOrElement;
};

type PrivateNoDataProps = NoDataProps & {
  readonly children?: ReactNode;
};

const NoData = ({ title, subTitle, button, icon, children, ...props }: PrivateNoDataProps): JSX.Element => (
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
