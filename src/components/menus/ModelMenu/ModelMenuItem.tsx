import React, { useMemo } from "react";
import { isNil, includes, map } from "lodash";
import classNames from "classnames";
import { Checkbox } from "antd";

import { VerticalFlexCenter, Menu } from "components";
import { isModelWithChildren } from "./typeguards";
import "./ModelMenu.scss";

export const ModelMenuItems = <M extends Model.M>(props: ModelMenuItemsProps<M>): JSX.Element => {
  const { models, ...rest } = props;
  return (
    <React.Fragment>
      {map(models, (model: M) => {
        return <ModelMenuItem<M> key={model.id} model={model} {...rest} />;
      })}
    </React.Fragment>
  );
};

export const ExtraModelMenuItem = (props: IExtraModelMenuItem & { active: boolean }): JSX.Element => {
  return (
    <Menu.MenuItem
      className={classNames("model-menu-item", "model-menu-item--empty", { active: props.active })}
      onClick={(e: React.MouseEvent<HTMLLIElement>) => !isNil(props.onClick) && props.onClick(e)}
    >
      {!isNil(props.icon) && <div className={"icon-container"}>{props.icon}</div>}
      {props.text}
    </Menu.MenuItem>
  );
};

const ModelMenuItem = <M extends Model.M>(props: ModelMenuItemProps<M>): JSX.Element => {
  const { model, ...primary } = props;
  const {
    menuId,
    highlightActive,
    multiple,
    selected,
    hidden,
    visible,
    levelIndent,
    level,
    checkbox,
    focusedIndex,
    indexMap,
    itemProps,
    leftAlign,
    bordersForLevels,
    onPress,
    renderItem,
    ...rest
  } = primary;

  const isActive = useMemo(() => {
    if (includes(selected, model.id)) {
      if (multiple === true && checkbox === true) {
        // If we are operating with checkboxes, the highlightActive property
        // needs to be explicitly set.
        return highlightActive === true;
      }
      return highlightActive !== false;
    }
    return false;
  }, [highlightActive, multiple, selected, model]);

  const isVisible = useMemo(() => {
    if (!isNil(hidden)) {
      if (includes(hidden, model.id)) {
        return false;
      } else if (!isNil(visible) && !includes(visible, model.id)) {
        return false;
      }
      return true;
    } else if (!isNil(visible)) {
      return includes(visible, model.id);
    } else {
      return true;
    }
  }, [visible, hidden, model]);

  if (!isVisible === false) {
    return (
      <React.Fragment>
        <Menu.MenuItem
          {...rest} // Required for Antd Menu Item
          {...itemProps}
          key={model.id}
          id={`model-menu-${menuId}-item-${model.id}`}
          onClick={(e: React.MouseEvent<HTMLLIElement>) => {
            e.stopPropagation();
            onPress(model, e);
          }}
          className={classNames("model-menu-item", !isNil(itemProps) ? itemProps.className : "", {
            active: isActive,
            focus: !isNil(focusedIndex) ? focusedIndex === indexMap[String(model.id)] : false,
            "left-align": leftAlign === true
          })}
          style={{
            ...(!isNil(itemProps) ? itemProps.style : {}),
            ...(!isNil(levelIndent) ? { paddingLeft: 10 + levelIndent * level } : { paddingLeft: 10 }),
            borderTop: level === 0 && bordersForLevels === true ? "1px solid #EFEFEF" : "none",
            paddingTop: level === 0 ? 4 : 2,
            paddingBottom: level === 0 ? 4 : 2,
            height: level === 0 ? "32px" : "28px"
          }}
        >
          {checkbox ? (
            <div className={"with-checkbox-wrapper"}>
              <Checkbox checked={includes(selected, model.id)} />
              <VerticalFlexCenter style={{ overflowX: "hidden" }}>
                {renderItem(model, { level: level, index: indexMap[String(model.id)] })}
              </VerticalFlexCenter>
            </div>
          ) : (
            <VerticalFlexCenter style={{ overflowX: "hidden" }}>
              {renderItem(model, { level: level, index: indexMap[String(model.id)] })}
            </VerticalFlexCenter>
          )}
        </Menu.MenuItem>
        {isModelWithChildren(model) && model.children.length !== 0 && (
          <ModelMenuItems<M> {...primary} models={model.children} level={props.level + 1} />
        )}
      </React.Fragment>
    );
  }
  return <></>;
};

export default ModelMenuItem;
