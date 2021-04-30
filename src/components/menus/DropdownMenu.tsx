import React, { ReactNode } from "react";
import { map, filter, isNil } from "lodash";
import classNames from "classnames";

import { Menu } from "antd";

import { IconOrSpinner, VerticalFlexCenter } from "components";

export interface IDropdownMenuItem {
  id: any;
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  onClick?: () => void;
  icon?: JSX.Element;
  disabled?: boolean;
  visible?: boolean;
}

const isDropdownMenuItemInterface = (obj: IDropdownMenuItem | JSX.Element): obj is IDropdownMenuItem => {
  return (obj as any).type === undefined;
};

interface _DropdownItemProps extends IDropdownMenuItem {
  children?: ReactNode;
  generalClassName?: string;
  generalStyle?: React.CSSProperties;
}

export const DropdownMenuItem: React.FC<_DropdownItemProps> = ({
  className,
  disabled,
  icon,
  loading,
  text,
  children,
  visible,
  style = {},
  generalStyle = {},
  generalClassName,
  onClick,
  ...props
}: _DropdownItemProps): JSX.Element => {
  if (visible === false) {
    return <></>;
  }
  return (
    <Menu.Item
      {...props}
      className={classNames("dropdown-menu-item", generalClassName, className, {
        disabled: disabled === true
      })}
      onClick={() => {
        if (!(disabled === true)) {
          if (!isNil(onClick)) {
            onClick();
          }
        }
      }}
      style={{ ...generalStyle, ...style }}
    >
      {!isNil(children) ? (
        <>{children}</>
      ) : (
        <React.Fragment>
          {!isNil(icon) && (
            <VerticalFlexCenter>
              <IconOrSpinner size={16} loading={loading} icon={icon} />
            </VerticalFlexCenter>
          )}
          {text}
        </React.Fragment>
      )}
    </Menu.Item>
  );
};

export interface IDropdownMenu extends StandardComponentProps {
  items: IDropdownMenuItem[] | JSX.Element[];
  onClick?: (id: any) => void;
  onChange?: (id: any) => void;
  itemProps?: StandardComponentProps;
}

const DropdownMenu = ({
  items,
  onClick,
  onChange,
  className,
  itemProps = {},
  ...props
}: IDropdownMenu): JSX.Element => {
  return (
    <Menu className={classNames("dropdown-menu", className)}>
      {map(
        filter(
          items,
          (item: IDropdownMenuItem | JSX.Element) => !isDropdownMenuItemInterface(item) || item.visible !== false
        ),
        (item: IDropdownMenuItem | JSX.Element, index: number) => {
          if (isDropdownMenuItemInterface(item)) {
            return (
              <DropdownMenuItem
                key={index}
                {...props}
                generalClassName={classNames("dropdown-menu-item", itemProps.className)}
                generalStyle={itemProps.style}
                {...item}
                onClick={() => {
                  if (!isNil(item.onClick)) {
                    item.onClick();
                  }
                  if (!isNil(onClick)) {
                    onClick(item.id);
                  }
                  if (!isNil(onChange)) {
                    onChange(item.id);
                  }
                }}
              />
            );
          } else {
            return <React.Fragment key={index}>{item}</React.Fragment>;
          }
        }
      )}
    </Menu>
  );
};

DropdownMenu.Item = DropdownMenuItem;

export default DropdownMenu;
