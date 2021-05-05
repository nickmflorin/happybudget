import React, { useState, useMemo, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import { isNil, find, uniqueId } from "lodash";
import classNames from "classnames";

import { Dropdown } from "antd";
import { DropDownProps } from "antd/lib/dropdown";

import { CaretButton } from "components/buttons";
import { CaretButtonProps } from "components/buttons/CaretButton";
import { BudgetItemTreeMenu } from "components/menus";
import { EntityText } from "components/typography";
import { flattenTreeNodes } from "lib/model/util";
import { isNodeDescendantOf } from "lib/util";

export interface BudgetItemsTreeDropdownProps extends Omit<DropDownProps, "overlay"> {
  className?: string;
  value?: number;
  placeholderText?: string;
  onChange?: (item: Model.SimpleAccount | Model.SimpleSubAccount) => void;
  nodes: Model.Tree;
  buttonProps?: CaretButtonProps;
}

const BudgetItemsTreeDropdown: React.FC<BudgetItemsTreeDropdownProps> = ({
  className,
  nodes,
  value,
  placeholderText,
  trigger = ["click"],
  buttonProps,
  onChange
}) => {
  const [visible, setVisible] = useState(false);
  const [_value, setValue] = useState<number | undefined>(value);
  const [currentNode, setCurrentNode] = useState<Model.SimpleAccount | Model.SimpleSubAccount | undefined>(undefined);
  const flattenedNodes = useMemo(() => flattenTreeNodes(nodes), [nodes]);
  const buttonId = useMemo(() => uniqueId("budget-items-tree-select-button-"), []);

  useEffect(() => {
    if (!isNil(_value)) {
      const node: Model.SimpleAccount | Model.SimpleSubAccount | undefined = find(flattenedNodes, { id: _value });
      if (!isNil(node)) {
        setCurrentNode(node);
      }
    }
  }, [_value]);

  return (
    <Dropdown
      visible={visible}
      className={classNames("dropdown", className)}
      placement={"bottomRight"}
      overlayStyle={{ position: "fixed" }}
      trigger={trigger}
      overlay={
        <ClickAwayListener
          onClickAway={(event: any) => {
            const parent = document.getElementById(`#${buttonId}`);
            if (isNil(parent) || (parent !== event.srcElement && !isNodeDescendantOf(parent, event.srcElement))) {
              setVisible(false);
            }
          }}
        >
          <BudgetItemTreeMenu
            nodes={nodes}
            onChange={(id: number) => {
              setValue(id);
              const node = find(flattenedNodes, { id });
              if (!isNil(node) && !isNil(onChange)) {
                onChange(node);
              }
            }}
            value={value}
          />
        </ClickAwayListener>
      }
    >
      <CaretButton id={`#${buttonId}`} onClick={() => setVisible(!visible)} {...buttonProps}>
        {!isNil(currentNode) ? (
          <EntityText fillEmpty={"---------"}>{currentNode}</EntityText>
        ) : !isNil(placeholderText) ? (
          placeholderText
        ) : (
          ""
        )}
      </CaretButton>
    </Dropdown>
  );
};

export default BudgetItemsTreeDropdown;
