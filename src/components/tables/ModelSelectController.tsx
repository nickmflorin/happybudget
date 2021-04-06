import React, { useState, useEffect, ReactNode } from "react";
import classNames from "classnames";
import { map, isNil, find, forEach, filter } from "lodash";

import { Tooltip, Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { ShowHide } from "components/display";
import { IconButton } from "components/control/buttons";
import { toTitleCase } from "lib/util/formatters";

export interface ModelSelectControllerItemProps<M extends Model> {
  filterSelected?: (data: M) => boolean;
  tooltip?: boolean | string | ((data: M[]) => string);
  icon: ReactNode;
  onClick?: (data: M[]) => void;
  disableWhenEmpty?: boolean;
  hideWhenEmpty?: boolean;
  minimumCount?: number;
  actionName?: string;
}

interface _ModelSelectControllerItemProps<M extends Model> extends ModelSelectControllerItemProps<M> {
  selectedModels: M[];
  entityName: string;
}

export const ModelSelectControllerItem = <M extends Model>({
  filterSelected,
  tooltip = true,
  icon,
  onClick,
  selectedModels,
  actionName,
  entityName = "item",
  disableWhenEmpty = true,
  hideWhenEmpty = false,
  minimumCount = 1
}: _ModelSelectControllerItemProps<M>) => {
  const [filtered, setFiltered] = useState<M[]>([]);
  const [tooltipString, setTooltipString] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!isNil(filterSelected)) {
      setFiltered(filter(selectedModels, filterSelected));
    } else {
      setFiltered(selectedModels);
    }
  }, [selectedModels, filterSelected]);

  useEffect(() => {
    if (typeof tooltip === "string") {
      setTooltipString(tooltip as string);
    } else if (typeof tooltip === "boolean") {
      if (tooltip === true && !isNil(actionName)) {
        const tooltipS = `${toTitleCase(actionName)} ${filtered.length} selected ${entityName.toLocaleLowerCase()}${
          filtered.length === 1 ? "" : "s"
        }.`;
        setTooltipString(tooltipS);
      }
    } else {
      setTooltipString(tooltip(filtered));
    }
  }, [filtered, tooltip, actionName, entityName]);

  if (!isNil(tooltipString)) {
    return (
      <ShowHide hide={hideWhenEmpty === true && filtered.length < minimumCount}>
        <Tooltip title={tooltipString}>
          <IconButton
            className={"select-controller-icon-button"}
            icon={icon}
            onClick={() => !isNil(onClick) && onClick(filtered)}
            disabled={disableWhenEmpty === true && filtered.length < minimumCount}
          />
        </Tooltip>{" "}
      </ShowHide>
    );
  } else {
    return (
      <ShowHide hide={hideWhenEmpty === true && filtered.length < minimumCount}>
        <IconButton
          className={"select-controller-icon-button"}
          icon={icon}
          onClick={() => !isNil(onClick) && onClick(filtered)}
          disabled={disableWhenEmpty === true && filtered.length < minimumCount}
        />
      </ShowHide>
    );
  }
};

interface ModelSelectControllerProps<M extends Model> {
  className?: string;
  style?: React.CSSProperties;
  selected: number[];
  data: M[];
  items: ModelSelectControllerItemProps<M>[];
  entityName?: string;
  checkable?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
}

const ModelSelectController = <M extends Model>({
  items,
  selected,
  data,
  className,
  style,
  entityName = "item",
  checkable = false,
  onCheckboxChange
}: ModelSelectControllerProps<M>) => {
  const [selectedModels, setSelectedModels] = useState<M[]>([]);

  useEffect(() => {
    const models: M[] = [];
    forEach(selected, (id: number) => {
      const model = find(data, { id });
      if (!isNil(model)) {
        models.push(model as M);
      } else {
        /* eslint-disable no-console */
        console.warn(`Could not find model for ID ${id} in provided data.`);
      }
    });
    setSelectedModels(models);
  }, [selected, data]);

  return (
    <div className={classNames("select-controller", className)} style={style}>
      <ShowHide show={checkable}>
        <Checkbox
          checked={data.length !== 0 && selected.length === data.length}
          onChange={(e: CheckboxChangeEvent) => {
            if (!isNil(onCheckboxChange)) {
              onCheckboxChange(e.target.checked);
            }
          }}
        />
      </ShowHide>
      {map(items, (item: ModelSelectControllerItemProps<M>, index: number) => {
        return (
          <ModelSelectControllerItem key={index} selectedModels={selectedModels} entityName={entityName} {...item} />
        );
      })}
      <div className={"select-controller-selected-text"}>
        {selected.length !== 0
          ? `Selected ${selected.length} ${toTitleCase(entityName)}${selected.length === 1 ? "" : "s"}`
          : `No ${toTitleCase(entityName)}s Selected`}
      </div>
    </div>
  );
};

export default ModelSelectController;
