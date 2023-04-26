import { ReactNode } from "react";

import classNames from "classnames";

import { ui } from "lib";
import * as icons from "lib/ui/icons"
import { PrimaryButton } from "components/buttonsOld";

export type NoDataProps = ui.ComponentProps<{
  readonly title?: string;
  readonly subTitle?: string;
  readonly button?: { readonly onClick?: () => void; readonly text: string };
  readonly icon?: icons.IconProp;
}>

type PrivateNoDataProps = NoDataProps & {
  readonly children?: ReactNode;
};

export const NoData = ({
  title,
  subTitle,
  button,
  icon,
  children,
  ...props
}: PrivateNoDataProps): JSX.Element => (
  <div {...props} className={classNames("no-data", props.className)}>
    <div className="no-data-content">
      {children}
      {title !== undefined && <h1>{title}</h1>}
      {subTitle !== undefined && <p>{subTitle}</p>}
      {button !== undefined && (
        <PrimaryButton style={{ marginTop: 20 }} icon={icon} onClick={() => button.onClick?.()}>
          {button.text}
        </PrimaryButton>
      )}
    </div>
  </div>
);
