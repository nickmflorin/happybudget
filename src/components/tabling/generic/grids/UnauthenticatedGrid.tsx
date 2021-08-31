import React, { useMemo } from "react";
import { map, reduce } from "lodash";

import { tabling, hooks } from "lib";
import BaseFramework from "components/tabling/generic/framework";
import Grid, { GridProps } from "./Grid";

export interface UnauthenticatedGridProps<R extends Table.RowData, M extends Model.Model = Model.Model>
  extends GridProps<R, M> {
  readonly framework?: Table.Framework;
}

const UnauthenticatedGrid = <R extends Table.RowData, M extends Model.Model = Model.Model>({
  framework,
  ...props
}: UnauthenticatedGridProps<R, M>): JSX.Element => {
  const frameworkComponents = useMemo<Table.FrameworkGroup>((): Table.FrameworkGroup => {
    const combinedFramework = tabling.aggrid.combineFrameworks(BaseFramework, framework);
    return {
      ...reduce(
        combinedFramework.cells?.[props.id],
        (prev: Table.FrameworkGroup, cell: React.ComponentType<any>, name: string) => ({ ...prev, [name]: cell }),
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
          cellRendererParams: { ...col.cellRendererParams, readOnly: true }
        } as Table.Column<R, M>)
    );
  }, [hooks.useDeepEqualMemo(props.columns)]);

  return <Grid {...props} columns={columns} frameworkComponents={frameworkComponents} />;
};

export default UnauthenticatedGrid;
