import { useMemo } from "react";
import { Style } from "@react-pdf/types";
import classNames from "classnames";
import { isNil, map, flatten, reduce } from "lodash";

import { ShowHide } from "components";
import { View, Text } from "components/pdf";
import { tabling } from "lib";

const isCallback = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R], RV = any>(
  /* eslint-disable indent */
  prop: Table.PdfOptionalCellCallback<R, M, V, RV>
): prop is Table.PdfCellCallback<R, M, V, RV> => {
  return typeof prop === "function";
};

const evaluateOptionalCallbackProp = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  V = R[keyof R],
  RV = any
>(
  /* eslint-disable indent */
  prop: Table.PdfOptionalCellCallback<R, M, V, RV> | undefined,
  params: Table.PdfCellCallbackParams<R, M, V>
) => {
  if (isCallback(prop)) {
    return prop(params);
  }
  return prop;
};

const evaluateClassName = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>(
  className: Table.PdfCellClassName<R, M, V>,
  params: Table.PdfCellCallbackParams<R, M, V>
): (string | undefined)[] => {
  if (Array.isArray(className)) {
    const parts: (string | Table.PdfCellCallback<R, M, V> | Table.PdfCellClassName<R, M, V> | undefined)[] = className;
    return flatten(
      map(parts, (csName: string | Table.PdfCellCallback<R, M, V> | Table.PdfCellClassName<R, M, V> | undefined) =>
        evaluateClassName(csName, params)
      )
    );
  } else {
    return [evaluateOptionalCallbackProp<R, M, V>(className, params)];
  }
};

const evaluateCellStyle = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>(
  styleObj: Table.PdfCellStyle<R, M, V>,
  params: Table.PdfCellCallbackParams<R, M, V>
): Style | undefined => {
  if (Array.isArray(styleObj)) {
    return reduce(
      styleObj,
      (obj: Style, newObj: Table.PdfCellStyle<R, M, V>) => ({
        ...obj,
        ...evaluateCellStyle(newObj, params)
      }),
      {}
    );
  } else {
    return evaluateOptionalCallbackProp<R, M, V>(styleObj, params);
  }
};

export interface RowExplicitCellProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  V = R[keyof R]
> {
  readonly style?: Table.PdfCellStyle<R, M, V>;
  readonly className?: Table.PdfCellClassName<R, M, V>;
  readonly textStyle?: Table.PdfCellStyle<R, M, V>;
  readonly textClassName?: Table.PdfCellClassName<R, M, V>;
  readonly cellContentsVisible?: Table.PdfOptionalCellCallback<R, M, any, boolean>;
  readonly cellContentsInvisible?: Table.PdfOptionalCellCallback<R, M, any, boolean>;
}

export interface CellProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>
  extends RowExplicitCellProps<R, M, V> {
  readonly column: Table.PdfColumn<R, M, V>;
  readonly colIndex: number;
  readonly isHeader?: boolean;
  readonly debug?: boolean;
  readonly indented?: boolean;
}

export interface PrivateCellProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>
  extends CellProps<R, M, V> {
  readonly rawValue: V | null;
  readonly value: string;
}

const Cell = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = R[keyof R]>(
  props: PrivateCellProps<R, M, V>
): JSX.Element => {
  const callbackParams = useMemo<Table.PdfCellCallbackParams<R, M, V>>(() => {
    return {
      colIndex: props.colIndex,
      column: props.column,
      isHeader: props.isHeader || false,
      indented: props.indented === true,
      rawValue: props.rawValue,
      value: props.value
    };
  }, [props.colIndex, props.column, props.isHeader, props.rawValue, props.value]);

  const cellStyle = useMemo(() => {
    return {
      ...evaluateOptionalCallbackProp<R, M, V, Style>(
        props.isHeader === true ? props.column.pdfHeaderCellProps?.style : props.column.pdfCellProps?.style,
        callbackParams
      ),
      // The width will be configured before the column is plugged into this component.
      width: `${(props.column.pdfWidth || 0.0) * 100.0}%`,
      ...evaluateCellStyle<R, M, V>(props.style, callbackParams)
    };
  }, [props.column]);

  return (
    <View
      className={classNames(
        evaluateClassName<R, M, V>(
          props.isHeader === true ? props.column.pdfHeaderCellProps?.className : props.column.pdfCellProps?.className,
          callbackParams
        ),
        evaluateClassName<R, M, V>(props.className, callbackParams),
        { indented: props.indented === true }
      )}
      style={cellStyle}
      debug={props.debug}
    >
      <ShowHide
        hide={
          props.indented === true ||
          evaluateOptionalCallbackProp<R, M, V, boolean>(props.cellContentsVisible, callbackParams) === false ||
          evaluateOptionalCallbackProp<R, M, V, boolean>(props.cellContentsInvisible, callbackParams) === true ||
          evaluateOptionalCallbackProp<R, M, V, boolean>(props.column.pdfCellContentsVisible, callbackParams) === false
        }
      >
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
            style={{
              // NOTE: We do not differentiate between the text style and overall style for
              // column types, since these are also used for the AG Grid tables.  We need to
              // figure out a way to differentiate between the two, because here - we are just
              // assuming that the column type styling only applies to the text.
              ...(!isNil(props.column.columnType)
                ? tabling.columns.getColumnTypeCSSStyle(props.column.columnType, {
                    header: props.isHeader || false,
                    pdf: true
                  })
                : ({} as Style)),
              ...evaluateOptionalCallbackProp<R, M, V, Style>(
                props.isHeader === true
                  ? props.column.pdfHeaderCellProps?.textStyle
                  : props.column.pdfCellProps?.textStyle,
                callbackParams
              ),
              ...evaluateCellStyle<R, M, V>(props.textStyle, callbackParams)
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
