import React, { forwardRef, useMemo, RefObject, ForwardedRef } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ui } from "lib";

import { Icon } from "components";

/* eslint-disable indent */
const Cell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: Table.CellWithChildrenProps<R, M, S>,
  ref: ForwardedRef<HTMLDivElement>
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
    <div
      id={props.id}
      className={classNames(
        "inner-cell",
        !isNil(props.innerCellClassName) && typeof props.innerCellClassName === "function"
          ? props.innerCellClassName(row)
          : props.innerCellClassName
      )}
      style={{
        ...props.style,
        ...(!isNil(props.innerCellStyle) && typeof props.innerCellStyle === "function"
          ? props.innerCellStyle(row)
          : props.innerCellStyle)
      }}
      ref={ref}
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
    </div>
  );
};

type CellComponent = {
  <
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>
  >(
    props: Table.CellWithChildrenProps<R, M, S> & { readonly ref?: RefObject<HTMLDivElement> }
  ): JSX.Element;
};

export default React.memo(forwardRef(Cell)) as CellComponent;
