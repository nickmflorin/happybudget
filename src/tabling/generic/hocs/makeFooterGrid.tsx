import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil, map } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

import { hooks, tabling } from "lib";

import { GridProps, AuthenticatedGridProps, UnauthenticatedGridProps } from "../grids";

type WithFooterGridProps<T> = T & { readonly id: "page" | "footer" };

export interface FooterGridProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends GridProps<R, M> {
  readonly constrainHorizontally?: boolean;
}

export interface AuthenticatedFooterGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends AuthenticatedGridProps<R, M> {
  readonly constrainHorizontally?: boolean;
}

export interface UnauthenticatedFooterGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> extends UnauthenticatedGridProps<R, M> {
  readonly constrainHorizontally?: boolean;
}

const FooterGrid =
  <
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends FooterGridProps<R, M> = FooterGridProps<R, M>
  >(
    config: Table.FooterGridConfig<R, M>
  ) =>
  (
    Component:
      | React.ComponentClass<WithFooterGridProps<T>, Record<string, unknown>>
      | React.FunctionComponent<WithFooterGridProps<T>>
  ): React.FunctionComponent<Omit<T, "id">> => {
    function WithFooterGrid(props: T) {
      const columns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
        const UniversalFooterColumn = (col: Table.DataColumn<R, M>): Table.DataColumn<R, M> => {
          const footerColumn = config.getFooterColumn(col);
          if (!isNil(footerColumn)) {
            return {
              ...col,
              ...footerColumn
            };
          }
          return col;
        };
        return map(props.columns, (col: Table.Column<R, M>) =>
          tabling.typeguards.isDataColumn(col) ? UniversalFooterColumn(col) : col
        );
      }, [hooks.useDeepEqualMemo(props.columns)]);

      return (
        <Component
          {...props}
          id={config.id}
          columns={columns}
          data={[tabling.managers.createFooterRow({ gridId: config.id })]}
          headerHeight={0}
          rowHeight={config.rowHeight || 38}
          className={classNames("grid--footer", config.className, {
            "constrain-horizontally": props.constrainHorizontally
          })}
          rowClass={classNames("row--footer", config.rowClass)}
        />
      );
    }
    return hoistNonReactStatics(WithFooterGrid, React.memo(Component)) as React.FunctionComponent<Omit<T, "id">>;
  };

export default FooterGrid;
