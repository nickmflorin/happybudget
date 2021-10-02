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

const evaluateOptionalCallbackProp = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, T = any>(
  /* eslint-disable indent */
  prop: Table.PdfOptionalCellCallback<R, M, T> | undefined,
  params: Table.PdfCellCallbackParams<R, M>
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

export interface CellProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
  readonly column: Table.PdfColumn<R, M>;
  readonly row: R;
  readonly colIndex: number;
  readonly style?: Table.PdfCellStyle<R, M>;
  readonly className?: Table.PdfCellClassName<R, M>;
  readonly textStyle?: Table.PdfCellStyle<R, M>;
  readonly textClassName?: Table.PdfCellClassName<R, M>;
  readonly formatting?: boolean;
  readonly isHeader?: boolean;
  readonly debug?: boolean;
  readonly indented?: boolean;
  readonly border?: boolean;
  readonly cellContentsVisible?: Table.PdfOptionalCellCallback<R, M, boolean>;
}

const Cell = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: CellProps<R, M>
): JSX.Element => {
  const callbackParams = useMemo<Omit<Table.PdfCellCallbackParams<R, M>, "value" | "rawValue">>(() => {
    return {
      colIndex: props.colIndex,
      row: props.row,
      column: props.column,
      isHeader: props.isHeader || false,
      indented: props.indented === true
    };
  }, [props.colIndex, props.row, props.column, props.isHeader]);

  const rawValue: R[keyof R] = useMemo((): R[keyof R] => {
    if (!isNil(props.column.valueGetter)) {
      return props.column.valueGetter(props.row);
    } else if (!isNil(props.column.field)) {
      return props.row[props.column.field];
    }
    return props.column.nullValue === undefined
      ? ("" as unknown as R[keyof R])
      : (props.column.nullValue as R[keyof R]);
  }, [callbackParams, props.row, props.column]);

  const value = useMemo(() => {
    if (isNil(props.column.formatter) || props.formatting === false) {
      return rawValue;
    } else if (rawValue !== null && (typeof rawValue === "string" || typeof rawValue === "number")) {
      return props.column.formatter(rawValue);
    }
    return "";
  }, [rawValue, props.column, props.formatting]);

  const fullCallbackParams = useMemo<Table.PdfCellCallbackParams<R, M>>(() => {
    return { ...callbackParams, rawValue, value };
  }, [rawValue, value, callbackParams]);

  const cellStyle = useMemo(() => {
    return {
      ...evaluateOptionalCallbackProp<R, M, Style>(
        props.isHeader === true ? props.column.headerCellProps?.style : props.column.cellProps?.style,
        fullCallbackParams
      ),
      // The width will be configured before the column is plugged into this component.
      width: `${(props.column.width || 0.0) * 100.0}%`,
      ...evaluateCellStyle<R, M>(props.style, fullCallbackParams)
    };
  }, [props.column]);

  return (
    <View
      className={classNames(
        evaluateClassName<R, M>(
          props.isHeader === true ? props.column.headerCellProps?.className : props.column.cellProps?.className,
          fullCallbackParams
        ),
        evaluateClassName<R, M>(props.className, fullCallbackParams),
        { indented: props.indented === true }
      )}
      style={cellStyle}
      debug={props.debug}
    >
      <ShowHide
        hide={
          props.indented === true ||
          evaluateOptionalCallbackProp<R, M, boolean>(props.cellContentsVisible, fullCallbackParams) === false ||
          evaluateOptionalCallbackProp<R, M, boolean>(props.column.cellContentsVisible, fullCallbackParams) === false
        }
      >
        {props.isHeader !== true && !isNil(props.column.cellRenderer) ? (
          props.column.cellRenderer(fullCallbackParams)
        ) : (
          <Text
            className={classNames(
              "cell-text",
              evaluateClassName<R, M>(
                props.isHeader === true
                  ? props.column.headerCellProps?.textClassName
                  : props.column.cellProps?.textClassName,
                fullCallbackParams
              ),
              evaluateClassName<R, M>(props.textClassName, fullCallbackParams)
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
                fullCallbackParams
              ),
              ...evaluateCellStyle<R, M>(props.textStyle, fullCallbackParams)
            }}
          >
            {value}
          </Text>
        )}
      </ShowHide>
    </View>
  );
};

export default Cell;
