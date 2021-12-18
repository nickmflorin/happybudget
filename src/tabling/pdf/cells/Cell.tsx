import { useMemo } from "react";
import classNames from "classnames";
import { isNil, map, flatten, reduce } from "lodash";

import { ShowHide } from "components";
import { View, Text } from "components/pdf";
import { tabling } from "lib";

const isCallback = <
  RV,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  prop: Table.PdfOptionalCellCallback<RV, R, M, Table.InferColumnValue<C>>
): prop is Table.PdfCellCallback<RV, R, M, Table.InferColumnValue<C>> => {
  return typeof prop === "function";
};

const evaluateOptionalCallbackProp = <
  RV,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  prop: Table.PdfOptionalCellCallback<RV, R, M, Table.InferColumnValue<C>> | undefined,
  params: Table.PdfCellCallbackParams<R, M, Table.InferColumnValue<C>>
) => {
  if (isCallback(prop)) {
    return prop(params);
  }
  return prop;
};

const evaluateClassName = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  className: Table.PdfCellClassName<R, M, Table.InferColumnValue<C>>,
  params: Table.PdfCellCallbackParams<R, M, Table.InferColumnValue<C>>
): (string | undefined)[] => {
  if (Array.isArray(className)) {
    const parts: (
      | string
      | Table.PdfCellCallback<string, R, M, Table.InferColumnValue<C>>
      | Table.PdfCellClassName<R, M, Table.InferColumnValue<C>>
      | undefined
    )[] = className;
    return flatten(
      map(
        parts,
        (
          csName:
            | string
            | Table.PdfCellCallback<string, R, M, Table.InferColumnValue<C>>
            | Table.PdfCellClassName<R, M, Table.InferColumnValue<C>>
            | undefined
        ) => evaluateClassName(csName, params)
      )
    );
  } else {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return [evaluateOptionalCallbackProp<any, R, M, C>(className, params)];
  }
};

const evaluateCellStyle = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  styleObj: Table.PdfCellStyle<R, M, Table.InferColumnValue<C>>,
  params: Table.PdfCellCallbackParams<R, M, Table.InferColumnValue<C>>
): Pdf.Style | undefined => {
  if (Array.isArray(styleObj)) {
    return reduce(
      styleObj,
      (obj: Pdf.Style, newObj: Table.PdfCellStyle<R, M, Table.InferColumnValue<C>>) => ({
        ...obj,
        ...evaluateCellStyle(newObj, params)
      }),
      {}
    );
  } else {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return evaluateOptionalCallbackProp<any, R, M, C>(styleObj, params);
  }
};

export interface RowExplicitCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> {
  readonly style?: Table.PdfCellStyle<R, M, Table.InferColumnValue<C>>;
  readonly className?: Table.PdfCellClassName<R, M, Table.InferColumnValue<C>>;
  readonly textStyle?: Table.PdfCellStyle<R, M, Table.InferColumnValue<C>>;
  readonly textClassName?: Table.PdfCellClassName<R, M, Table.InferColumnValue<C>>;
  readonly cellContentsVisible?: Table.PdfOptionalCellCallback<boolean, R, M>;
  readonly cellContentsInvisible?: Table.PdfOptionalCellCallback<boolean, R, M>;
}

export interface CellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> extends RowExplicitCellProps<R, M, C> {
  readonly column: C;
  readonly colIndex: number;
  readonly isHeader?: boolean;
  readonly debug?: boolean;
  readonly indented?: boolean;
}

export interface PrivateCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> extends CellProps<R, M, C> {
  readonly row?: Table.Row<R>;
  readonly rawValue: Table.InferColumnValue<C>;
  readonly value: string;
}

const Cell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  props: PrivateCellProps<R, M, C>
): JSX.Element => {
  const callbackParams = useMemo<Table.PdfCellCallbackParams<R, M, Table.InferColumnValue<C>>>(() => {
    return {
      colIndex: props.colIndex,
      column: props.column,
      row: props.row,
      isHeader: props.isHeader || false,
      indented: props.indented === true,
      rawValue: props.rawValue,
      value: props.value
    };
  }, [props.row, props.colIndex, props.column, props.isHeader, props.rawValue, props.value]);

  const cellStyle = useMemo(() => {
    return {
      ...evaluateOptionalCallbackProp<Pdf.Style, R, M, C>(
        props.isHeader === true ? props.column.pdfHeaderCellProps?.style : props.column.pdfCellProps?.style,
        callbackParams
      ),
      /* The width will be configured before the column is plugged into this
         component. */
      width: `${(props.column.pdfWidth || 0.0) * 100.0}%`,
      ...evaluateCellStyle<R, M, C>(props.style, callbackParams)
    };
  }, [props.column]);

  return (
    <View
      className={classNames(
        evaluateClassName<R, M, C>(
          props.isHeader === true ? props.column.pdfHeaderCellProps?.className : props.column.pdfCellProps?.className,
          callbackParams
        ),
        evaluateClassName<R, M, C>(props.className, callbackParams),
        { indented: props.indented === true }
      )}
      style={cellStyle}
      debug={props.debug}
    >
      <ShowHide
        hide={
          props.indented === true ||
          evaluateOptionalCallbackProp<boolean, R, M, C>(props.cellContentsVisible, callbackParams) === false ||
          evaluateOptionalCallbackProp<boolean, R, M, C>(props.cellContentsInvisible, callbackParams) === true ||
          evaluateOptionalCallbackProp<boolean, R, M, C>(props.column.pdfCellContentsVisible, callbackParams) === false
        }
      >
        {props.isHeader !== true && !isNil(props.column.pdfCellRenderer) ? (
          props.column.pdfCellRenderer(callbackParams)
        ) : (
          <Text
            className={classNames(
              "cell-text",
              evaluateClassName<R, M, C>(
                props.isHeader === true
                  ? props.column.pdfHeaderCellProps?.textClassName
                  : props.column.pdfCellProps?.textClassName,
                callbackParams
              ),
              evaluateClassName<R, M, C>(props.textClassName, callbackParams)
            )}
            style={{
              /* NOTE: We do not differentiate between the text style and
								 overall style for column types, since these are also used for
								 the AG Grid tables.  We need to figure out a way to
								 differentiate between the two, because here - we are just
								 assuming that the column type styling only applies to the
								 text. */
              ...(!isNil(props.column.columnType)
                ? tabling.columns.getColumnTypeCSSStyle(props.column.columnType, {
                    header: props.isHeader || false,
                    pdf: true
                  })
                : ({} as Pdf.Style)),
              ...evaluateOptionalCallbackProp<Pdf.Style, R, M, C>(
                props.isHeader === true
                  ? props.column.pdfHeaderCellProps?.textStyle
                  : props.column.pdfCellProps?.textStyle,
                callbackParams
              ),
              ...evaluateCellStyle<R, M, C>(props.textStyle, callbackParams)
            }}
          >
            {props.value || ""}
          </Text>
        )}
      </ShowHide>
    </View>
  );
};

export default Cell;
