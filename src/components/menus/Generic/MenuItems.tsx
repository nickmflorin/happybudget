import React from "react";
import { map, includes } from "lodash";

import { RecursiveMenuItem } from "./MenuItem";

const MenuItems = <M extends Model.Model>(props: IMenuItems<M>): JSX.Element => {
  return (
    <React.Fragment>
      {map(props.models, (m: M, index: number) => {
        return (
          <RecursiveMenuItem<M>
            // Top level props for the Menu Item.
            key={`${props.menuId}-${m.id}-${index}`}
            style={props.itemProps?.style}
            className={props.itemProps?.className}
            model={m}
            menuId={props.menuId}
            level={props.level}
            renderContent={props.renderContent}
            focused={props.isFocused(m)}
            selected={includes(props.selected, m.id)}
            checkbox={props.checkbox}
            closeParentDropdown={props.closeParentDropdown}
            keepDropdownOpenOnClick={props.keepDropdownOpenOnClick}
            getLabel={props.getLabel}
            onClick={(event: MenuItemClickEvent<M>) => props.onClick?.(event)}
            // Recursive props that are needed to recursively generate more Menu Item(s).
            recursion={props}
          />
        );
      })}
    </React.Fragment>
  );
};

export default React.memo(MenuItems) as typeof MenuItems;
