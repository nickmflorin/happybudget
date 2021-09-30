import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ui } from "lib";

import { VerticalFlexCenter, Icon } from "components";
import { ClearButton } from "components/buttons";
import LoadableCellWrapper from "./LoadableCellWrapper";

/* eslint-disable indent */
const Cell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  props: Table.CellWithChildrenProps<R, M, S>
): JSX.Element => {
  const row: Table.BodyRow<R> = props.node.data;

  const showClearButton = useMemo(() => {
    if (!isNil(props.onClear)) {
      if (!isNil(props.showClear)) {
        return props.showClear(row, props.customCol);
      } else if (!isNil(props.hideClear)) {
        return !props.hideClear;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }, [props.onClear, props.showClear, props.hideClear, row, props.colDef]);

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
    <div
      id={props.id}
      className={classNames("inner-cell", props.className)}
      style={props.style}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => !isNil(props.onKeyDown) && props.onKeyDown(event)}
    >
      <LoadableCellWrapper loading={props.loading}>{props.children}</LoadableCellWrapper>

      {!isNil(icon) ? (
        <div className={"icon-wrapper"}>
          {ui.typeguards.iconIsJSX(icon) ? icon : <Icon icon={icon} weight={"light"} />}
        </div>
      ) : (
        <></>
      )}

      {showClearButton && (
        <VerticalFlexCenter>
          <ClearButton
            onClick={(event: React.MouseEvent<HTMLElement>) => {
              // TODO: Figure out how to stop propogation!
              !isNil(props.onClear) && !isNil(props.colDef) && props.onClear(row, props.customCol);
            }}
          />
        </VerticalFlexCenter>
      )}
    </div>
  );
};

export default React.memo(Cell) as typeof Cell;
