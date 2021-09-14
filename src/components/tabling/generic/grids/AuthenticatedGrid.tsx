import React, { useMemo } from "react";
import { map, isNil, reduce } from "lodash";

import { SelectionChangedEvent } from "@ag-grid-community/core";

import { tabling, hooks } from "lib";
import { framework as generic } from "components/tabling/generic";
import Grid, { GridProps } from "./Grid";

export interface AuthenticatedGridProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> extends GridProps<R, M> {
  readonly apis: Table.GridApis | null;
  readonly framework?: Table.Framework;
  readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>>;
  readonly onChangeEvent: (event: Table.ChangeEvent<R, M, G>) => void;
  readonly onRowSelectionChanged?: (rows: Table.DataRow<R, M>[]) => void;
}

/* eslint-disable indent */
const AuthenticatedGrid = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>({
  framework,
  footerRowSelectors,
  ...props
}: AuthenticatedGridProps<R, M, G>): JSX.Element => {
  const frameworkComponents = useMemo<Table.FrameworkGroup>((): Table.FrameworkGroup => {
    const combinedFramework = tabling.aggrid.combineFrameworks(generic.Framework, framework);
    return {
      ...reduce(
        combinedFramework.cells?.[props.id],
        (prev: Table.FrameworkGroup, cell: React.ComponentType<any>, name: string) => ({
          ...prev,
          [name]: cell
          // [name]: generic.connectCellToStore({ gridId: props.id, footerRowSelectors })(cell)
        }),
        {}
      ),
      ...reduce(
        combinedFramework.editors,
        (prev: Table.FrameworkGroup, editor: React.ComponentType<any>, name: string) => {
          return { ...prev, [name]: editor };
        },
        {}
      )
    };
  }, [framework, props.id]);

  const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    return map(
      props.columns,
      (col: Table.Column<R, M>): Table.Column<R, M> =>
        ({
          ...col,
          cellRendererParams: { ...col.cellRendererParams, onChangeEvent: props.onChangeEvent, readOnly: false }
        } as Table.Column<R, M>)
    );
  }, [hooks.useDeepEqualMemo(props.columns)]);

  const onSelectionChanged: (e: SelectionChangedEvent) => void = hooks.useDynamicCallback(
    (e: SelectionChangedEvent) => {
      if (!isNil(props.apis)) {
        const selected: Table.DataRow<R, M>[] = props.apis.grid.getSelectedRows();
        props.onRowSelectionChanged?.(selected);
      }
    }
  );
  return (
    <Grid
      {...props}
      columns={columns}
      frameworkComponents={frameworkComponents}
      onSelectionChanged={onSelectionChanged}
      // Required to get processCellFromClipboard to work with column spanning.
      suppressCopyRowsToClipboard={true}
    />
  );
};

export default AuthenticatedGrid;
