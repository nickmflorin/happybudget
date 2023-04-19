import React, { useMemo } from "react";

import classNames from "classnames";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil, map } from "lodash";

import { hooks, tabling } from "lib";

import { GridProps, AuthenticatedGridProps, PublicGridProps } from "../grids";

type WithFooterGridProps<T> = T & { readonly id: "page" | "footer" };

export interface FooterGridProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> extends GridProps<R, M> {
  readonly constrainHorizontally?: boolean;
  readonly apis: Table.GridApis | null;
}

export interface AuthenticatedFooterGridProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> extends AuthenticatedGridProps<R, M> {
  readonly constrainHorizontally?: boolean;
}

export interface PublicFooterGridProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> extends PublicGridProps<R, M> {
  readonly constrainHorizontally?: boolean;
}

const FooterGrid =
  <
    R extends Table.RowData,
    M extends model.RowTypedApiModel = model.RowTypedApiModel,
    T extends FooterGridProps<R, M> = FooterGridProps<R, M>,
  >(
    config: Table.FooterGridConfig<R, M>,
  ) =>
  (
    Component: React.FunctionComponent<WithFooterGridProps<T>>,
  ): React.FunctionComponent<Omit<T, "id">> => {
    function WithFooterGrid(props: T) {
      const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
        const UniversalFooterColumn = (col: Table.DataColumn<R, M>): Table.DataColumn<R, M> => {
          const footerColumn = config.getFooterColumn(col);
          if (!isNil(footerColumn)) {
            return {
              ...col,
              ...footerColumn,
            };
          }
          return col;
        };
        return map(props.columns, (col: Table.Column<R, M>) =>
          tabling.columns.isDataColumn(col) ? UniversalFooterColumn(col) : col,
        );
      }, [hooks.useDeepEqualMemo(props.columns)]);

      return (
        <Component
          {...props}
          id={config.id}
          columns={columns}
          data={[tabling.rows.createFooterRow({ gridId: config.id })]}
          headerHeight={0}
          rowHeight={config.rowHeight || 38}
          className={classNames("grid--footer", config.className, {
            "constrain-horizontally": props.constrainHorizontally,
          })}
          rowClass={classNames("row--footer", config.rowClass)}
        />
      );
    }
    return hoistNonReactStatics(WithFooterGrid, React.memo(Component)) as React.FunctionComponent<
      Omit<T, "id">
    >;
  };

export default FooterGrid;
