import React, { useMemo } from "react";
import { isNil } from "lodash";

import { ui } from "lib";

import { Icon } from "components";

/* eslint-disable indent */
const Cell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: Table.CellWithChildrenProps<R, M, S>
): JSX.Element => {
  const row: Table.BodyRow<R> = props.node.data;

  const icon = useMemo<IconOrElement | null | undefined>(() => {
    if (!isNil(props.icon)) {
      if (typeof props.icon === "function") {
        return props.icon(row);
      }
      return props.icon;
    }
    return null;
  }, [props.icon]);

  return (
    <span
      id={props.id}
      style={props.style}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => !isNil(props.onKeyDown) && props.onKeyDown(event)}
    >
      {props.children}
      {!isNil(icon) ? (
        <div className={"icon-wrapper"}>
          {ui.typeguards.iconIsJSX(icon) ? icon : <Icon icon={icon} weight={"light"} />}
        </div>
      ) : (
        <></>
      )}
    </span>
  );
};

export default React.memo(Cell) as typeof Cell;
