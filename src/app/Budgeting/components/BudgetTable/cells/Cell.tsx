import React, { ReactNode, useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";

import { ICellRendererParams, ColDef, Column } from "@ag-grid-community/core";

import { IconButton } from "components/buttons";
import { ShowHide } from "components";
import LoadableCellWrapper from "./LoadableCellWrapper";

import "./index.scss";

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
export type StandardCellProps = ICellRendererParams;

export interface CellProps<R extends Table.Row>
  extends Omit<StandardCellProps, "value" | "column">,
    StandardComponentProps {
  onClear?: (row: R, colDef: ColDef) => void;
  showClear?: (row: R, colDef: ColDef) => boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  loading?: boolean;
  hideClear?: boolean;
  children: ReactNode;
  hide?: boolean;
  show?: boolean;
  column: Column;
}

const Cell = <R extends Table.Row>(props: CellProps<R>): JSX.Element => {
  const row: R = props.node.data;

  const showClearButton = useMemo(() => {
    if (!isNil(props.onClear)) {
      if (!isNil(props.showClear) && !isNil(props.colDef)) {
        return props.showClear(row, props.colDef);
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
    <ShowHide show={props.show} hide={props.hide}>
      <div
        id={props.id}
        className={classNames("cell", props.className)}
        style={props.style}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => !isNil(props.onKeyDown) && props.onKeyDown(event)}
      >
        <LoadableCellWrapper loading={props.loading}>
          <span className={"cell-content"}>{props.children}</span>
        </LoadableCellWrapper>
        {showClearButton && (
          <IconButton
            className={"btn--clear-cell"}
            size={"small"}
            icon={<FontAwesomeIcon icon={faTimesCircle} />}
            onClick={(event: React.MouseEventHandler<HTMLElement>) => {
              // TODO: Figure out how to stop propogation!
              !isNil(props.onClear) && !isNil(props.colDef) && props.onClear(row, props.colDef);
            }}
          />
        )}
      </div>
    </ShowHide>
  );
};

export default Cell;
