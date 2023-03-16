import React, { ReactNode, useMemo } from "react";

import { isNil } from "lodash";

import { tabling } from "lib";
import { Icon } from "components";
import { IconButton } from "components/buttons";
import { InfoTooltip } from "components/tooltips";

import BodyCell from "./BodyCell";
import connectCellToStore from "./connectCellToStore";

const CalculatedCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>({
  hasInfo,
  onInfoClicked,
  infoTooltip,
  ...props
}: Table.CalculatedCellProps<R, M, C, S>): JSX.Element => {
  const row: Table.ModelRow<R> | Table.FooterRow = props.node.data;
  const col = props.customCol;

  const _hasInfo = useMemo(
    () =>
      tabling.rows.isModelRow(row)
        ? typeof hasInfo === "function"
          ? hasInfo({ row, col: props.customCol }) === true
          : hasInfo === true
        : false,
    [hasInfo, row, props.customCol],
  );

  const prefixChildren = useMemo(() => {
    if (tabling.rows.isModelRow(row) && _hasInfo) {
      const toolTipContent = infoTooltip?.({ col, row });
      if (!isNil(onInfoClicked)) {
        return (
          <div className="info-wrapper">
            <IconButton
              className="btn--cell-info"
              onClick={() => onInfoClicked?.({ row, col })}
              icon={<Icon icon="circle-info" weight="solid" />}
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
          <div className="info-wrapper">
            <InfoTooltip content={toolTipContent}>
              <Icon className="icon--cell-info" icon="circle-info" weight="solid" />
            </InfoTooltip>
          </div>
        );
      }
    }
    return <></>;
  }, [onInfoClicked, row, col, infoTooltip]);

  return (
    <BodyCell<R, M, C, S, number | null, Table.CalculatedColumn<R, M, number | null>>
      {...props}
      prefixChildren={prefixChildren}
    />
  );
};

export default connectCellToStore<
  Table.CalculatedCellProps<
    Table.RowData,
    Model.RowHttpModel,
    Table.Context,
    Redux.TableStore<Table.RowData>
  >,
  Table.RowData,
  Model.RowHttpModel,
  Table.Context,
  Redux.TableStore<Table.RowData>,
  number | null,
  Table.CalculatedColumn<Table.RowData, Model.RowHttpModel, number | null>
>(React.memo(CalculatedCell)) as typeof CalculatedCell;
