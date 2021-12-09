import { useState, useCallback } from "react";
import { isNil, map, includes, filter } from "lodash";
import classNames from "classnames";
import "./HorizontalMenu.scss";

export interface IHorizontalMenuItem<I extends string = string> {
  id: I;
  label: string;
  onClick?: () => void;
}

interface HorizontalMenuItemProps<I extends string = string>
  extends IHorizontalMenuItem<I>,
    Omit<StandardComponentProps, "id"> {
  selected: boolean;
}

export const HorizontalMenuItem = <I extends string = string>({
  label,
  selected,
  className,
  style = {},
  onClick
}: HorizontalMenuItemProps<I>): JSX.Element => {
  return (
    <div
      onClick={() => !isNil(onClick) && onClick()}
      className={classNames("horizontal-menu-item", { "horizontal-menu-item-selected": selected }, className)}
      style={style}
    >
      {label}
    </div>
  );
};

interface HorizontalMenuProps<I extends string = string> extends StandardComponentProps {
  onChange?: (item: IHorizontalMenuItem<I>, selected: boolean) => void;
  items: IHorizontalMenuItem<I>[];
  selected?: I | I[];
  itemProps?: StandardComponentProps;
}

const HorizontalMenu = <I extends string = string>({
  items,
  selected,
  className,
  style = {},
  itemProps,
  onChange
}: HorizontalMenuProps<I>): JSX.Element => {
  const [_selected, setSelected] = useState<I | I[]>(selected || items[0].id);

  const isItemSelected = useCallback(
    (item: IHorizontalMenuItem) => {
      if (!isNil(selected)) {
        /* In this case, the component is "controlled" (i.e. the selected state
					 is determined from the passed in selected prop). */
        if (Array.isArray(selected)) {
          return includes(selected, item.id);
        }
        return selected === item.id;
      } else {
        /* In this case, the component is "uncontrolled" (i.e. the selected
					 state is determined from internal state). */
        if (Array.isArray(_selected)) {
          return includes(_selected, item.id);
        }
        return _selected === item.id;
      }
    },
    [selected, _selected]
  );

  return (
    <div className={classNames("horizontal-menu", className)} style={style}>
      {map(items, (item: IHorizontalMenuItem<I>, index: number) => (
        <HorizontalMenuItem
          key={index}
          {...item}
          {...itemProps}
          selected={isItemSelected(item)}
          onClick={() => {
            if (!isNil(onChange)) {
              onChange(item, isItemSelected(item));
            }
            if (!isNil(item.onClick)) {
              item.onClick();
            }
            // Maintain internal reference to the currently selected items.
            if (Array.isArray(_selected)) {
              if (includes(_selected, item.id)) {
                setSelected(filter(_selected, (id: I) => id !== item.id));
              } else {
                setSelected([..._selected, item.id]);
              }
            } else {
              setSelected(item.id);
            }
          }}
        />
      ))}
    </div>
  );
};

export default HorizontalMenu;
