import { useMemo } from "react";
import classNames from "classnames";
import { isNil, map } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import { hooks } from "lib";

import { GridProps } from "../grids";

type WithFooterGridProps<T> = T & { readonly id: "page" | "footer" };

/* eslint-disable indent */
const FooterGrid =
  <
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    T extends GridProps<R, M, G> = GridProps<R, M, G>
  >(
    config: TableUi.FooterGridConfig<R, M, G>
  ) =>
  (
    Component: React.ComponentClass<WithFooterGridProps<T>, {}> | React.FunctionComponent<WithFooterGridProps<T>>
  ): React.FunctionComponent<Omit<T, "id">> => {
    function WithFooterGrid(props: T) {
      const columns = useMemo<Table.Column<R, M, G>[]>((): Table.Column<R, M, G>[] => {
        const UniversalFooterColumn = (col: Table.Column<R, M, G>): Table.Column<R, M, G> => {
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
        return map(props.columns, (col: Table.Column<R, M, G>) => UniversalFooterColumn(col));
      }, [hooks.useDeepEqualMemo(props.columns)]);

      return (
        <Component
          {...props}
          id={config.id}
          columns={columns}
          data={[{ id: config.rowId, data: {} }]}
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
