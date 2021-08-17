import React, { useMemo } from "react";
import { map, reduce } from "lodash";

import { tabling, hooks } from "lib";
import BaseFramework from "components/tabling/generic/framework";
import Grid, { GridProps } from "./Grid";

export interface ReadOnlyGridProps<R extends Table.Row = any, M extends Model.Model = any> extends GridProps<R, M> {
  readonly framework?: Table.Framework;
}

const ReadOnlyGrid = <R extends Table.Row, M extends Model.Model>({
  framework,
  ...props
}: ReadOnlyGridProps<R, M>): JSX.Element => {
  const frameworkComponents = useMemo<Table.FrameworkGroup>((): Table.FrameworkGroup => {
    const combinedFramework = tabling.util.combineFrameworks(BaseFramework, framework);
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

export default ReadOnlyGrid;
