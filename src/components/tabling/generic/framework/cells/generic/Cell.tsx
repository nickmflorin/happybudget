import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { VerticalFlexCenter } from "components";
import { ClearButton } from "components/buttons";
import LoadableCellWrapper from "./LoadableCellWrapper";

/* eslint-disable indent */
const Cell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  props: Table.CellWithChildrenProps<R, M, G, S>
): JSX.Element => {
  const row: Table.Row<R, M> = props.node.data;

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

  return (
    <div
      id={props.id}
      className={classNames("inner-cell", props.className)}
      style={props.style}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => !isNil(props.onKeyDown) && props.onKeyDown(event)}
    >
      <LoadableCellWrapper loading={props.loading}>{props.children}</LoadableCellWrapper>

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
