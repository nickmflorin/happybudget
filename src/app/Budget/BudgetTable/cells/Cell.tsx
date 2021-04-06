import React, { ReactNode, useMemo } from "react";
import classNames from "classnames";
import { isNil, includes } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams, ColDef } from "ag-grid-community";

import { IconButton } from "components/control/buttons";
import { ShowHide } from "components/display";
import LoadableCellWrapper from "./LoadableCellWrapper";

import "./index.scss";

export type StandardCellProps<R extends Table.Row<any, any>> = ICellRendererParams;

export interface CellProps<R extends Table.Row<any, any>>
  extends Omit<ICellRendererParams, "value">,
    StandardComponentProps {
  onClear?: (row: R, colDef: ColDef) => void;
  showClear?: (row: R, colDef: ColDef) => boolean;
  hideClear?: (row: R, colDef: ColDef) => boolean;
  children: ReactNode;
  hide?: boolean;
  show?: boolean;
}

const Cell = <R extends Table.Row<any, any>>({
  children,
  node,
  colDef,
  className,
  style = {},
  hide,
  show,
  onClear,
  showClear,
  hideClear
}: CellProps<R>): JSX.Element => {
  const row: R = node.data;

  const showClearButton = useMemo(() => {
    if (!isNil(onClear)) {
      if (!isNil(showClear)) {
        return showClear(row, colDef);
      } else if (!isNil(hideClear)) {
        return !hideClear(row, colDef);
      } else {
        return true;
      }
    } else {
      return false;
    }
  }, [onClear, showClear, hideClear, row, colDef]);

  return (
    <ShowHide show={show} hide={hide}>
      <div className={classNames("cell", className)} style={style}>
        <LoadableCellWrapper loading={includes(row.meta.fieldsLoading, colDef.field)}>{children}</LoadableCellWrapper>
        {showClearButton && (
          <IconButton
            className={"btn--clear-cell"}
            size={"small"}
            icon={<FontAwesomeIcon icon={faTimesCircle} />}
            onClick={(event: React.MouseEventHandler<HTMLElement>) => {
              // TODO: Figure out how to stop propogation!
              !isNil(onClear) && onClear(row, colDef);
            }}
          />
        )}
      </div>
    </ShowHide>
  );
};

export default Cell;
