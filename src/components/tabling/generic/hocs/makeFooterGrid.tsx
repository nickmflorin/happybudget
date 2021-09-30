import { useMemo } from "react";
import classNames from "classnames";
import { isNil, map } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import { hooks, tabling } from "lib";

import { GridProps } from "../grids";

type WithFooterGridProps<T> = T & { readonly id: "page" | "footer" };

/* eslint-disable indent */
const FooterGrid =
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, T extends GridProps<R, M> = GridProps<R, M>>(
    config: TableUi.FooterGridConfig<R, M>
  ) =>
  (
    Component: React.ComponentClass<WithFooterGridProps<T>, {}> | React.FunctionComponent<WithFooterGridProps<T>>
  ): React.FunctionComponent<Omit<T, "id">> => {
    function WithFooterGrid(props: T) {
      const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
        const UniversalFooterColumn = (col: Table.Column<R, M>): Table.Column<R, M> => {
          const footerColumn = config.getFooterColumn(col);
          if (!isNil(footerColumn)) {
            return {
              ...col,
              ...footerColumn
            };
          }
          return col;
        };
        return map(props.columns, (col: Table.Column<R, M>) => UniversalFooterColumn(col));
      }, [hooks.useDeepEqualMemo(props.columns)]);

      return (
        <Component
          {...props}
          id={config.id}
          columns={columns}
          data={[tabling.rows.createFooterRow({ gridId: config.id })]}
          headerHeight={0}
          rowHeight={config.rowHeight || 38}
          className={classNames("grid--footer", config.className)}
          rowClass={classNames("row--footer", config.rowClass)}
        />
      );
    }
    return hoistNonReactStatics(WithFooterGrid, Component) as React.FunctionComponent<Omit<T, "id">>;
  };

export default FooterGrid;
