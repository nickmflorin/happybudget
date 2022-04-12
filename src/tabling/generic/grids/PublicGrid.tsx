import React, { useMemo } from "react";
import { reduce } from "lodash";

import { tabling } from "lib";
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

  return <Grid {...props} enableFillHandle={false} frameworkComponents={frameworkComponents} />;
};

export default React.memo(PublicGrid) as typeof PublicGrid;
