import { forwardRef } from "react";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/pro-solid-svg-icons";

import { Button } from "antd";

import { VerticalFlexCenter } from "components";
import { EntityText } from "components/typography";
import { EntityTextProps } from "components/typography/EntityText";

export interface EntityTextButtonProps extends Omit<EntityTextProps, "className" | "style">, StandardComponentProps {
  fillEmpty?: string;
  onClick?: () => void;
}

const EntityTextButton = (
  { children, className, fillEmpty, style = {}, ...props }: EntityTextButtonProps,
  ref: any
): JSX.Element => {
  return (
    <Button className={classNames("btn btn--entity-text", className)} style={style} {...props} ref={ref}>
      <div className={"entity-text-button-inner"}>
        <EntityText fillEmpty={fillEmpty}>{children}</EntityText>
        <VerticalFlexCenter className={"entity-text-button-caret"}>
          <FontAwesomeIcon className={"icon"} icon={faCaretDown} />
        </VerticalFlexCenter>
      </div>
    </Button>
  );
};

export default forwardRef(EntityTextButton);
