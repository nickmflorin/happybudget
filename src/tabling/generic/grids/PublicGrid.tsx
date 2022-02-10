import React, { useMemo } from "react";
import { map, reduce } from "lodash";

import { tabling, hooks } from "lib";
import { framework as generic } from "tabling/generic";
import Grid, { GridProps } from "./Grid";

export interface PublicGridProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends GridProps<R, M> {
  readonly framework?: Table.Framework;
}

const PublicGrid = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>({
  framework,
  ...props
}: PublicGridProps<R, M>): JSX.Element => {
  const frameworkComponents = useMemo<Table.FrameworkGroup>((): Table.FrameworkGroup => {
    const combinedFramework = tabling.aggrid.combineFrameworks(generic.Framework, framework);
    return {
      ...reduce(
        combinedFramework.cells?.[props.id],
        (prev: Table.FrameworkGroup, cell: React.ComponentType<Record<string, unknown>>, name: string) => ({
          ...prev,
          [name]: cell
        }),
        {}
      )
    };
  }, [framework, props.id]);

  const columns = useMemo<Table.Column<R, M>[]>(
    (): Table.Column<R, M>[] =>
      map(
        props.columns,
        (col: Table.Column<R, M>): Table.Column<R, M> =>
          tabling.typeguards.isRealColumn(col)
            ? {
                ...col,
                cellRendererParams: { ...col.cellRendererParams, readOnly: true }
              }
            : col
      ),
    [hooks.useDeepEqualMemo(props.columns)]
  );

  return <Grid {...props} columns={columns} frameworkComponents={frameworkComponents} />;
};

export default React.memo(PublicGrid) as typeof PublicGrid;
