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
  V extends Table.RawRowValue = Table.RawRowValue
>(
  prop: Table.PdfOptionalCellCallback<RV, R, M, V>
): prop is Table.PdfCellCallback<RV, R, M, V> => {
  return typeof prop === "function";
};

const evaluateOptionalCallbackProp = <
  RV,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>(
  prop: Table.PdfOptionalCellCallback<RV, R, M, V> | undefined,
  params: Table.PdfCellCallbackParams<R, M, V>
) => {
  if (isCallback(prop)) {
    return prop(params);
  }
  return prop;
};

const evaluateClassName = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>(
  className: Table.PdfCellClassName<R, M, V>,
  params: Table.PdfCellCallbackParams<R, M, V>
): (string | undefined)[] => {
  if (Array.isArray(className)) {
    const parts: (string | Table.PdfCellCallback<string, R, M, V> | Table.PdfCellClassName<R, M, V> | undefined)[] =
      className;
    return flatten(
      map(
        parts,
        (csName: string | Table.PdfCellCallback<string, R, M, V> | Table.PdfCellClassName<R, M, V> | undefined) =>
          evaluateClassName(csName, params)
      )
    );
  } else {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
    return [evaluateOptionalCallbackProp<any, R, M, V>(className, params)];
  }
};

const evaluateCellStyle = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>(
  styleObj: Table.PdfCellStyle<R, M, V>,
  params: Table.PdfCellCallbackParams<R, M, V>
): Pdf.Style | undefined => {
  if (Array.isArray(styleObj)) {
    return reduce(
      styleObj,
      (obj: Pdf.Style, newObj: Table.PdfCellStyle<R, M, V>) => ({
        ...obj,
        ...evaluateCellStyle(newObj, params)
      }),
      {}
    );
  } else {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any,  @typescript-eslint/no-unsafe-return*/
    return evaluateOptionalCallbackProp<any, R, M, V>(styleObj, params);
  }
};

export interface RowExplicitCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
> {
  readonly style?: Table.PdfCellStyle<R, M, V>;
  readonly className?: Table.PdfCellClassName<R, M, V>;
  readonly textStyle?: Table.PdfCellStyle<R, M, V>;
  readonly textClassName?: Table.PdfCellClassName<R, M, V>;
}

export interface CellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
> extends RowExplicitCellProps<R, M, V> {
  readonly column: Table.DataColumn<R, M, V>;
  readonly colIndex: number;
  readonly isHeader?: boolean;
  readonly debug?: boolean;
  readonly indented?: boolean;
  readonly hideContent?: boolean;
  readonly firstChild: boolean;
  readonly lastChild: boolean;
}

export interface PrivateCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
> extends CellProps<R, M, V> {
  readonly row?: Table.Row<R>;
  readonly rawValue: V;
  readonly value: string;
}

const Cell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>(
  props: PrivateCellProps<R, M, V>
): JSX.Element => {
  const callbackParams = useMemo<Table.PdfCellCallbackParams<R, M, V>>(() => {
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
      ...evaluateOptionalCallbackProp<Pdf.Style, R, M, V>(
        props.isHeader === true ? props.column.pdfHeaderCellProps?.style : props.column.pdfCellProps?.style,
        callbackParams
      ),
      /* The width will be configured before the column is plugged into this
         component. */
      width: `${(props.column.pdfWidth || 0.0) * 100.0}%`,
      ...evaluateCellStyle<R, M, V>(props.style, callbackParams)
    };
  }, [props.column]);

  const className = useMemo(() => {
    let cs = ["td", props.className];
    if (props.firstChild) {
      cs = [...cs, "td-first-child"];
    }
    if (props.lastChild) {
      cs = [...cs, "td-last-child"];
    }
    return cs;
  }, [props.className, props.firstChild]);

  return (
    <View
      className={classNames(
        evaluateClassName<R, M, V>(
          props.isHeader === true ? props.column.pdfHeaderCellProps?.className : props.column.pdfCellProps?.className,
          callbackParams
        ),
        evaluateClassName<R, M, V>(className, callbackParams),
        { indented: props.indented === true }
      )}
      style={cellStyle}
      debug={props.debug}
    >
      <ShowHide hide={props.indented === true || props.hideContent === true}>
        {props.isHeader !== true && !isNil(props.column.pdfCellRenderer) ? (
          props.column.pdfCellRenderer(callbackParams)
        ) : (
          <Text
            className={classNames(
              "cell-text",
              evaluateClassName<R, M, V>(
                props.isHeader === true
                  ? props.column.pdfHeaderCellProps?.textClassName
                  : props.column.pdfCellProps?.textClassName,
                callbackParams
              ),
              evaluateClassName<R, M, V>(props.textClassName, callbackParams)
            )}
            style={
              {
                /* NOTE: We do not differentiate between the text style and
								 overall style for column types, since these are also used for
								 the AG Grid tables.  We need to figure out a way to
								 differentiate between the two, because here - we are just
								 assuming that the column type styling only applies to the
								 text. */
                ...(!isNil(props.column.dataType)
                  ? tabling.columns.getColumnTypeCSSStyle(props.column.dataType, {
                      header: props.isHeader || false,
                      pdf: true
                    })
                  : ({} as Pdf.Style)),
                ...evaluateOptionalCallbackProp<Pdf.Style, R, M, V>(
                  props.isHeader === true
                    ? props.column.pdfHeaderCellProps?.textStyle
                    : props.column.pdfCellProps?.textStyle,
                  callbackParams
                ),
                ...evaluateCellStyle<R, M, V>(props.textStyle, callbackParams)
              } as Pdf.Style
            }
          >
            {props.value || ""}
          </Text>
        )}
      </ShowHide>
    </View>
  );
};

export default Cell;
