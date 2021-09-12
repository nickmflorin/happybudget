import { useMemo } from "react";
import classNames from "classnames";
import { isNil, map } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import { hooks } from "lib";

import { GridProps } from "../grids";

type WithFooterGridProps<T> = T & { readonly id: "page" | "footer" };

/* eslint-disable indent */
const FooterGrid =
  <R extends Table.RowData, T extends GridProps<R> = GridProps<R>>(config: TableUi.FooterGridConfig<R>) =>
  (
    Component: React.ComponentClass<WithFooterGridProps<T>, {}> | React.FunctionComponent<WithFooterGridProps<T>>
  ): React.FunctionComponent<Omit<T, "id">> => {
    function WithFooterGrid(props: T) {
      const columns = useMemo<Table.Column<R>[]>((): Table.Column<R>[] => {
        const UniversalFooterColumn = (col: Table.Column<R>): Table.Column<R> => {
          const footerColumn = config.getFooterColumn(col);
          if (!isNil(footerColumn)) {
            return {
              ...col,
              ...footerColumn,
              editable: false
            };
          }
          return { ...col, editable: false };
        };
        return map(props.columns, (col: Table.Column<R>) => UniversalFooterColumn(col));
      }, [hooks.useDeepEqualMemo(props.columns)]);

      return (
        <Component
          {...props}
          id={config.id}
          columns={columns}
          data={[{ id: config.rowId, meta: {} }]}
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
