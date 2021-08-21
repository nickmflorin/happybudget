import { useRef } from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";

import { Button } from "components/buttons";

import Menu, { MenuWithItemsProps } from "./Menu";
import MenuWrapper from "./MenuWrapper";

export interface ExpandedMenuProps extends MenuWithItemsProps {
  readonly buttons?: IMenuButton[];
}

const ExpandedMenu = ({ className, style, buttons, ...props }: ExpandedMenuProps): JSX.Element => {
  const menu = useRef<IMenuRef>(null);

  return (
    <MenuWrapper className={classNames("expanded-menu", className)} style={style}>
      <Menu {...props} ref={menu} />
      {!isNil(buttons) && (
        <div className={"btn-container"}>
          {map(buttons, (btn: IMenuButton, index: number) => {
            return (
              <Button
                key={index}
                className={classNames("btn btn--menu", btn.className)}
                style={btn.style}
                onClick={() => {
                  if (!isNil(menu.current)) {
                    const state = menu.current.getState();
                    btn.onClick?.(state);
                  }
                }}
              >
                {btn.text}
              </Button>
            );
          })}
        </div>
      )}
    </MenuWrapper>
  );
};

export default ExpandedMenu;
