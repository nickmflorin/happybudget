import { isNil } from "lodash";

import { Icon } from "components";
import { Button } from "components/buttons";

import "./NoBudgets.scss";
import classNames from "classnames";

interface NoBudgetsProps extends StandardComponentWithChildrenProps {
  readonly title: string;
  readonly subTitle?: boolean;
  readonly button?: { onClick?: () => void; text: string };
}

const NoBudgets = ({ title, subTitle, button, children, ...props }: NoBudgetsProps): JSX.Element => {
  return (
    <div {...props} className={classNames("no-budgets", props.className)}>
      {children}
      <h1>{title}</h1>
      {!isNil(subTitle) && (
        // eslint-disable-next-line prettier/prettier
        <p>{"Tip: Click the \"Create Budget\" button above and create an empty budget or start one from a template."}</p>
      )}
      {!isNil(button) && (
        <Button
          style={{ marginTop: 20 }}
          className={"btn btn--primary"}
          icon={<Icon icon={"plus"} weight={"light"} />}
          onClick={button.onClick}
        >
          {button.text}
        </Button>
      )}
    </div>
  );
};

export default NoBudgets;
