import React, { ReactNode, forwardRef, useMemo, RefObject, ForwardedRef } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ui, tabling } from "lib";

import { Icon } from "components";
import { IconButton } from "components/buttons";
import { InfoTooltip } from "components/tooltips";

const Cell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  V extends Table.RawRowValue = any,
  C extends Table.RealColumn<R, M, V> = Table.BodyColumn<R, M, V>
>(
  props: Table.CellWithChildrenProps<R, M, S, V, C>,
  ref: ForwardedRef<HTMLDivElement>
): JSX.Element => {
  const row: Table.BodyRow<R> = props.node.data;
  const col = props.customCol;

  const icon = useMemo<IconOrElement | null | undefined>(() => {
    if (!isNil(props.icon)) {
      if (typeof props.icon === "function") {
        return props.icon(row);
      }
      return props.icon;
    }
    return null;
  }, [props.icon]);

  const infoComponent = useMemo(() => {
    if (tabling.rows.isModelRow(row) && tabling.columns.isCalculatedColumn<R, M>(col)) {
      const toolTipContent = props.infoTooltip?.({ col, row });
      if (!isNil(props.onInfoClicked)) {
        return (
          <div className={"info-wrapper"}>
            <IconButton
              className={"btn--cell-info"}
              onClick={() => props.onInfoClicked?.({ row, col })}
              icon={<Icon icon={"circle-info"} weight={"solid"} />}
              tooltip={
                !isNil(toolTipContent)
                  ? ({ children }: { children: ReactNode }) => (
                      <InfoTooltip content={toolTipContent}>{children}</InfoTooltip>
                    )
                  : undefined
              }
            />
          </div>
        );
      } else if (!isNil(toolTipContent)) {
        return (
          <div className={"info-wrapper"}>
            <InfoTooltip content={toolTipContent}>
              <Icon className={"icon--cell-info"} icon={"circle-info"} weight={"solid"} />
            </InfoTooltip>
          </div>
        );
      }
    }
    return <></>;
  }, [props.onInfoClicked, row, col, props.infoTooltip]);

  return (
    <div
      id={props.id}
      className={classNames(
        "inner-cell",
        props.className,
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
      {infoComponent}
      {props.children}
      {!isNil(icon) ? (
        <div className={"icon-wrapper"}>{ui.iconIsJSX(icon) ? icon : <Icon icon={icon} weight={"light"} />}</div>
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
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    V extends Table.RawRowValue = any,
    C extends Table.RealColumn<R, M, V> = Table.BodyColumn<R, M, V>
  >(
    props: Table.CellWithChildrenProps<R, M, S, V, C> & { readonly ref?: RefObject<HTMLDivElement> }
  ): JSX.Element;
};

export default React.memo(forwardRef(Cell)) as CellComponent;
