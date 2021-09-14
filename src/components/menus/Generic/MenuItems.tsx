import React from "react";
import { map, isNil, includes } from "lodash";

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
            focused={props.focusedIndex === props.indexMap[m.id]}
            selected={includes(props.selected, m.id)}
            checkbox={props.checkbox}
            levelIndent={props.levelIndent}
            bordersForLevels={props.bordersForLevels}
            closeParentDropdown={props.closeParentDropdown}
            getLabel={props.getLabel}
            onClick={(event: MenuItemClickEvent<M>) => {
              if (!isNil(props.getItemOnClickHandler)) {
                const handler = props.getItemOnClickHandler(event.model);
                handler?.(event);
              }
              props.onClick?.(event);
            }}
            // Recursive props that are needed to recursively generate more Menu Item(s).
            recursion={props}
          />
        );
      })}
    </React.Fragment>
  );
};

export default React.memo(MenuItems) as typeof MenuItems;
