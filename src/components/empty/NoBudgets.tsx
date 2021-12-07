import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Icon } from "components";
import { Button } from "components/buttons";

import "./NoBudgets.scss";

interface NoBudgetsProps extends StandardComponentWithChildrenProps {
  readonly title: string;
  readonly subTitle?: string;
  readonly button?: { readonly onClick?: () => void; readonly text: string };
}

const NoBudgets = ({ title, subTitle, button, children, ...props }: NoBudgetsProps): JSX.Element => {
  return (
    <div {...props} className={classNames("no-budgets", props.className)}>
      <div className={"no-budgets-content"}>
        {children}
        <h1>{title}</h1>
        {!isNil(subTitle) && <p>{subTitle}</p>}
        {!isNil(button) && (
          <Button
            style={{ marginTop: 20 }}
            className={"btn btn--primary"}
            icon={<Icon icon={"plus"} weight={"light"} />}
            onClick={() => button.onClick?.()}
          >
            {button.text}
          </Button>
        )}
      </div>
    </div>
  );
};

export default React.memo(NoBudgets);
