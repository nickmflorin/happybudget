import { useMemo } from "react";
import { Style } from "@react-pdf/types";
import classNames from "classnames";
import { isNil, map, flatten, reduce } from "lodash";

import { ShowHide } from "components";
import { View, Text } from "components/pdf";
import { tabling } from "lib";

const isCallback = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, T = any>(
  prop: Table.PdfOptionalCellCallback<R, M, T>
): prop is Table.PdfCellCallback<R, M, T> => {
  return typeof prop === "function";
};

const evaluateOptionalCallbackProp = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  V extends Table.PdfRawValue = Table.PdfRawValue,
  T = any
>(
  /* eslint-disable indent */
  prop: Table.PdfOptionalCellCallback<R, M, V, T> | undefined,
  params: Table.PdfCellCallbackParams<R, M, V>
) => {
  if (isCallback(prop)) {
    return prop(params);
  }
  return prop;
};

const evaluateClassName = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  className: Table.PdfCellClassName<R, M>,
  params: Table.PdfCellCallbackParams<R, M>
): (string | undefined)[] => {
  if (Array.isArray(className)) {
    const parts: (string | Table.PdfCellCallback<R, M> | Table.PdfCellClassName<R, M> | undefined)[] = className;
    return flatten(
      map(parts, (csName: string | Table.PdfCellCallback<R, M> | Table.PdfCellClassName<R, M> | undefined) =>
        evaluateClassName(csName, params)
      )
    );
  } else {
    return [evaluateOptionalCallbackProp<R, M>(className, params)];
  }
};

const evaluateCellStyle = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  styleObj: Table.PdfCellStyle<R, M>,
  params: Table.PdfCellCallbackParams<R, M>
): Style | undefined => {
  if (Array.isArray(styleObj)) {
    return reduce(
      styleObj,
      (obj: Style, newObj: Table.PdfCellStyle<R, M>) => ({
        ...obj,
        ...evaluateCellStyle(newObj, params)
      }),
      {}
    );
  } else {
    return evaluateOptionalCallbackProp(styleObj, params);
  }
};

export interface RowExplicitCellProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
  readonly style?: Table.PdfCellStyle<R, M>;
  readonly className?: Table.PdfCellClassName<R, M>;
  readonly textStyle?: Table.PdfCellStyle<R, M>;
  readonly textClassName?: Table.PdfCellClassName<R, M>;
  readonly cellContentsVisible?: Table.PdfOptionalCellCallback<R, M, boolean>;
}

export interface CellProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>
  extends RowExplicitCellProps<R, M> {
  readonly column: Table.PdfColumn<R, M>;
  readonly colIndex: number;
  readonly isHeader?: boolean;
  readonly debug?: boolean;
  readonly indented?: boolean;
}

interface PrivateCellProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>
  extends CellProps<R, M> {
  readonly rawValue: R[keyof R] | string | number | null;
  readonly value: string;
}

const Cell = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: PrivateCellProps<R, M>
): JSX.Element => {
  const callbackParams = useMemo<Table.PdfCellCallbackParams<R, M>>(() => {
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
      ...evaluateOptionalCallbackProp<R, M, Style>(
        props.isHeader === true ? props.column.headerCellProps?.style : props.column.cellProps?.style,
        callbackParams
      ),
      // The width will be configured before the column is plugged into this component.
      width: `${(props.column.width || 0.0) * 100.0}%`,
      ...evaluateCellStyle<R, M>(props.style, callbackParams)
    };
  }, [props.column]);

  return (
    <View
      className={classNames(
        evaluateClassName<R, M>(
          props.isHeader === true ? props.column.headerCellProps?.className : props.column.cellProps?.className,
          callbackParams
        ),
        evaluateClassName<R, M>(props.className, callbackParams),
        { indented: props.indented === true }
      )}
      style={cellStyle}
      debug={props.debug}
    >
      <ShowHide
        hide={
          props.indented === true ||
          evaluateOptionalCallbackProp<R, M, boolean>(props.cellContentsVisible, callbackParams) === false ||
          evaluateOptionalCallbackProp<R, M, boolean>(props.column.cellContentsVisible, callbackParams) === false
        }
      >
        {props.isHeader !== true && !isNil(props.column.cellRenderer) ? (
          props.column.cellRenderer(callbackParams)
        ) : (
          <Text
            className={classNames(
              "cell-text",
              evaluateClassName<R, M>(
                props.isHeader === true
                  ? props.column.headerCellProps?.textClassName
                  : props.column.cellProps?.textClassName,
                callbackParams
              ),
              evaluateClassName<R, M>(props.textClassName, callbackParams)
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
              ...evaluateOptionalCallbackProp<R, M, Style>(
                props.isHeader === true ? props.column.headerCellProps?.textStyle : props.column.cellProps?.textStyle,
                callbackParams
              ),
              ...evaluateCellStyle<R, M>(props.textStyle, callbackParams)
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
