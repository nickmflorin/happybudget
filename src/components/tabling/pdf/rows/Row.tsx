import React, { useMemo } from "react";

import classNames from "classnames";
import { map, isNil, filter } from "lodash";

import { View } from "components/pdf";

export type RowProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  V extends Table.RawRowValue = Table.RawRowValue,
> = Pdf.StandardComponentProps & {
  readonly columns: Table.DataColumn<R, M, V>[];
  readonly columnIndent?: number;
  readonly columnIsVisible?: (c: Table.DataColumn<R, M, V>) => boolean;
};

const Row = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  V extends Table.RawRowValue = Table.RawRowValue,
>(
  props: RowProps<R, M, V> & {
    readonly renderCell: (params: {
      column: Table.DataColumn<R, M, V>;
      indented: boolean;
      colIndex: number;
      firstChild: boolean;
      lastChild: boolean;
    }) => JSX.Element;
  },
): JSX.Element => {
  const columnFilter = useMemo(() => {
    const visibleFilter = props.columnIsVisible;
    if (!isNil(visibleFilter)) {
      return (c: Table.DataColumn<R, M, V>) => visibleFilter(c);
    }
    return () => true;
  }, [props.columnIsVisible]);

  return (
    <View style={props.style} className={classNames("tr", props.className)} wrap={false}>
      {map(
        filter(props.columns, columnFilter),
        (column: Table.DataColumn<R, M, V>, colIndex: number) => (
          <React.Fragment key={colIndex}>
            {props.renderCell({
              column,
              indented: !isNil(props.columnIndent) ? colIndex < props.columnIndent : false,
              colIndex,
              firstChild: colIndex === 0,
              lastChild: colIndex === filter(props.columns, columnFilter).length - 1,
            })}
          </React.Fragment>
        ),
      )}
    </View>
  );
};

export default Row;
