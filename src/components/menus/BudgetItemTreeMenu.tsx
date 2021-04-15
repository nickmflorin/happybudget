import React, { useState } from "react";
import { map, isNil } from "lodash";
import classNames from "classnames";

import { Menu } from "antd";
import { MenuProps, MenuItemProps } from "antd/lib/menu";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";

import { IconButton } from "components/buttons";
import { ShowHide } from "components";
import { EntityText } from "components/typography";

import "./BudgetItemTreeMenu.scss";

interface BudgetTreeMenuItemProps extends MenuItemProps {
  node: Model.BudgetItemNode;
  onDelta?: () => void;
  indentIndex: number;
  childrenVisible?: boolean;
  onToggleChildrenVisibility?: () => void;
  selected?: boolean;
}

export const BudgetItemMenuItem: React.FC<BudgetTreeMenuItemProps> = ({
  node,
  selected,
  indentIndex,
  childrenVisible,
  onToggleChildrenVisibility,
  ...props
}) => {
  return (
    <Menu.Item
      {...props}
      eventKey={node.id}
      style={{ paddingLeft: (indentIndex + 1) * 10 }}
      className={classNames("budget-item-tree-menu-item", { active: selected })}
    >
      <ShowHide show={!isNil(onToggleChildrenVisibility)}>
        <React.Fragment>
          <div style={{ flexGrow: 100, display: "flex" }}>
            <EntityText>{node}</EntityText>
          </div>
          <IconButton
            className={"btn--budget-item-menu-caret"}
            size={"small"}
            icon={<FontAwesomeIcon icon={childrenVisible ? faCaretUp : faCaretDown} />}
            onClick={(event: any) => {
              event.stopPropagation();
              !isNil(onToggleChildrenVisibility) && onToggleChildrenVisibility();
            }}
          />
        </React.Fragment>
      </ShowHide>
      <ShowHide show={isNil(onToggleChildrenVisibility)}>
        <React.Fragment>
          <EntityText>{node}</EntityText>
        </React.Fragment>
      </ShowHide>
    </Menu.Item>
  );
};

interface BudgetItemTreeMenuNodeProps extends MenuItemProps {
  node: Model.BudgetItemNode;
  indentIndex: number;
  childrenDefaultVisible?: boolean;
  selected?: number | undefined;
}

const BudgetItemMenuItemWithChildren: React.FC<BudgetItemTreeMenuNodeProps> = ({
  node,
  selected,
  indentIndex,
  childrenDefaultVisible = true,
  ...props
}) => {
  const [childrenVisible, setChildrenVisible] = useState(childrenDefaultVisible);

  return (
    <React.Fragment>
      <BudgetItemMenuItem
        {...props}
        key={node.id}
        selected={selected === node.id}
        node={node}
        indentIndex={indentIndex}
        childrenVisible={childrenVisible}
        onToggleChildrenVisibility={() => setChildrenVisible(!childrenVisible)}
      />
      <ShowHide show={childrenVisible}>
        {map(node.children, (child: Model.BudgetItemNode) => {
          return (
            <MenuNode
              {...props}
              selected={selected}
              indentIndex={indentIndex + 1}
              node={child}
              childrenDefaultVisible={childrenDefaultVisible}
            />
          );
        })}
      </ShowHide>
    </React.Fragment>
  );
};

const MenuNode: React.FC<BudgetItemTreeMenuNodeProps> = ({ node, selected, indentIndex, ...props }) => {
  if (node.children.length !== 0) {
    return <BudgetItemMenuItemWithChildren {...props} node={node} selected={selected} indentIndex={indentIndex} />;
  } else {
    return (
      <BudgetItemMenuItem
        {...props}
        key={node.id}
        node={node}
        selected={selected === node.id}
        indentIndex={indentIndex}
      />
    );
  }
};

interface TreeMenuProps extends Omit<MenuProps, "onChange"> {
  nodes: Model.BudgetItemNode[];
  childrenDefaultVisible?: boolean;
  onChange?: (id: number) => void;
  value?: number;
}

const BudgetItemTreeMenu: React.FC<TreeMenuProps> = ({
  nodes,
  onChange,
  childrenDefaultVisible = true,
  value,
  ...props
}) => {
  const [selected, setSelected] = useState<number | undefined>(value);

  return (
    <Menu
      {...props}
      className={"budget-item-tree-menu"}
      onClick={(info: any) => {
        info.domEvent.stopPropagation();
        setSelected(parseInt(info.key));
        !isNil(onChange) && onChange(parseInt(info.key));
      }}
    >
      {map(nodes, (node: Model.BudgetItemNode) => {
        return (
          <MenuNode
            key={node.id}
            indentIndex={0}
            selected={!isNil(value) ? value : selected}
            node={node}
            childrenDefaultVisible={childrenDefaultVisible}
          />
        );
      })}
    </Menu>
  );
};

export default BudgetItemTreeMenu;
