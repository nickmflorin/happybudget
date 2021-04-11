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
import { flattenBudgetItemNodes } from "lib/model/util";
import { isNodeDescendantOf } from "lib/util";

export interface BudgetItemsTreeDropdownProps extends Omit<DropDownProps, "overlay"> {
  className?: string;
  value?: number;
  placeholderText?: string;
  onChange?: (item: IBudgetItem) => void;
  nodes: IBudgetItemNode[];
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
  const [currentNode, setCurrentNode] = useState<IBudgetItem | undefined>(undefined);
  const flattenedBudgetItemTreeNodes = useMemo(() => flattenBudgetItemNodes(nodes), [nodes]);
  const buttonId = useMemo(() => uniqueId("budget-items-tree-select-button-"), []);

  useEffect(() => {
    if (!isNil(_value)) {
      const node = find(flattenedBudgetItemTreeNodes, { id: value });
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
              const node = find(flattenedBudgetItemTreeNodes, { id });
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
        {!isNil(currentNode) ? <EntityText>{currentNode}</EntityText> : !isNil(placeholderText) ? placeholderText : ""}
      </CaretButton>
    </Dropdown>
  );
};

export default BudgetItemsTreeDropdown;
