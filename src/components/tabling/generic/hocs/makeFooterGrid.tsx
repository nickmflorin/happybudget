import { useMemo } from "react";
import classNames from "classnames";
import { isNil, reduce, map, filter } from "lodash";
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
            /*
            While AG Grid will not break if we include extra properties on the ColDef(s)
            (properties from our own custom Table.Column model) - they will complain a lot.
            So we need to try to remove them.
            */
            const { value, ...agFooterColumn } = footerColumn;
            return {
              ...col,
              ...agFooterColumn,
              editable: false
            };
          }
          return { ...col, editable: false };
        };
        return map(props.columns, (col: Table.Column<R>) => UniversalFooterColumn(col));
      }, [hooks.useDeepEqualMemo(props.columns)]);

      const data = useMemo(
        () => [
          reduce(
            filter(columns, (c: Table.Column<R>) => c.isRead !== false),
            (obj: { [key: string]: any }, col: Table.Column<R>) => {
              obj[col.field as string] = null;
              const footerColumn = config.getFooterColumn(col);
              if (!isNil(footerColumn) && !isNil(footerColumn.value)) {
                obj[col.field as string] = footerColumn.value;
              }
              return obj;
            },
            {
              id: config.rowId,
              /*
              Note that this will not be typed in accordance with Table.RowMeta,
              but we will avoid bugs with it because we never access the rows of a Footer Grid.
              However, it is curious as to why TypeScript does not complain here, and we should
              invesitgate.
              */
              meta: {}
            }
          ) as R
        ],
        [hooks.useDeepEqualMemo(columns)]
      );

      return (
        <Component
          {...props}
          id={config.id}
          columns={columns}
          data={data}
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
