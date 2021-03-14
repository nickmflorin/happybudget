import React, { useState, useMemo, useEffect } from "react";
import ClickAwayListener from "react-click-away-listener";
import { map, uniqueId, isNil, find } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "antd";

import { CaretButton } from "components/control/buttons";
import { flattenBudgetItemTreeNodes } from "model";
import { isNodeDescendantOf } from "util/dom";
import "./BudgetItemsTreeSelect.scss";

interface MenuItemProps {
  node: IBudgetItemTreeNode;
  onClick?: () => void;
  index?: number;
}

export const MenuItem = ({ node, onClick, index = 0 }: MenuItemProps): JSX.Element => {
  return (
    <div className={"budget-items-tree-menu-item"} onClick={() => !isNil(onClick) && onClick()}>
      <div className={"budget-items-tree-menu-item-icon-container"} style={{ marginLeft: index * 10 }}>
        <FontAwesomeIcon icon={faSitemap} />
      </div>
      <div className={"budget-items-tree-menu-item-title"}>{node.identifier}</div>
    </div>
  );
};

interface MenuNodeProps {
  node: IBudgetItemTreeNode;
  onClick?: (node: IBudgetItemNode) => void;
  index?: number;
}

export const MenuNode = ({ node, onClick, index = 0 }: MenuNodeProps): JSX.Element => {
  if (node.children.length !== 0) {
    return (
      <React.Fragment>
        <MenuItem
          node={node}
          index={index}
          onClick={() => {
            const { children, ...withoutChildren } = node;
            !isNil(onClick) && onClick(withoutChildren);
          }}
        />
        <div className={"budget-items-tree-menu nested"}>
          {map(node.children, (child: IBudgetItemTreeNode) => {
            return <MenuNode key={child.id} index={index + 1} node={child} onClick={onClick} />;
          })}
        </div>
      </React.Fragment>
    );
  } else {
    return (
      <MenuItem
        node={node}
        index={index}
        onClick={() => {
          const { children, ...withoutChildren } = node;
          !isNil(onClick) && onClick(withoutChildren);
        }}
      />
    );
  }
};

interface TreeMenuProps {
  id: string;
  nodes: IBudgetItemTreeNode[];
  onClickAway: () => void;
  onChange?: (node: IBudgetItemNode) => void;
}

export const TreeMenu = ({ id, nodes, onClickAway, onChange }: TreeMenuProps): JSX.Element => {
  return (
    <ClickAwayListener
      onClickAway={(event: any) => {
        const parent = document.getElementById(`#${id}`);
        if (isNil(parent) || (parent !== event.srcElement && !isNodeDescendantOf(parent, event.srcElement))) {
          onClickAway();
        }
      }}
    >
      <div className={"budget-items-tree-menu"}>
        {map(nodes, (node: IBudgetItemTreeNode) => {
          return (
            <MenuNode key={node.id} node={node} onClick={(nd: IBudgetItemNode) => !isNil(onChange) && onChange(nd)} />
          );
        })}
      </div>
    </ClickAwayListener>
  );
};

export interface BudgetItemsTreeSelectProps {
  className?: string;
  value: number;
  placeholderText?: string;
  onChange?: (node: IBudgetItemNode) => void;
  nodes: IBudgetItemTreeNode[];
  trigger?: ("click" | "hover" | "contextMenu")[];
}

const BudgetItemsTreeSelect = ({
  className,
  nodes,
  value,
  placeholderText,
  onChange
}: BudgetItemsTreeSelectProps): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const [currentNode, setCurrentNode] = useState<IBudgetItemNode | undefined>(undefined);
  const id = useMemo(() => uniqueId("budget-items-tree-select-button-"), []);
  const flattenedBudgetItemTreeNodes = useMemo(() => flattenBudgetItemTreeNodes(nodes), [nodes]);

  useEffect(() => {
    const node = find(flattenedBudgetItemTreeNodes, { id: value });
    if (!isNil(node)) {
      setCurrentNode(node);
    }
  }, [value]);

  return (
    <Dropdown
      visible={visible}
      className={classNames("dropdown", className)}
      overlay={<TreeMenu id={id} nodes={nodes} onChange={onChange} onClickAway={() => setVisible(false)} />}
    >
      <CaretButton id={`#${id}`} onClick={() => setVisible(!visible)}>
        {!isNil(currentNode) ? currentNode.identifier : !isNil(placeholderText) ? placeholderText : ""}
      </CaretButton>
    </Dropdown>
  );
};

export default BudgetItemsTreeSelect;
