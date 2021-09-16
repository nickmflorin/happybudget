import { useMemo } from "react";
import { Style } from "@react-pdf/types";
import classNames from "classnames";
import { isNil, map, flatten, reduce } from "lodash";

import { ShowHide } from "components";
import { View, Text } from "components/pdf";
import { tabling } from "lib";

const isCallback = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, T = any>(
  prop: PdfTable.OptionalCellCallback<R, M, T>
): prop is PdfTable.CellCallback<R, M, T> => {
  return typeof prop === "function";
};

const evaluateOptionalCallbackProp = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, T = any>(
  /* eslint-disable indent */
  prop: PdfTable.OptionalCellCallback<R, M, T> | undefined,
  params: PdfTable.CellCallbackParams<R, M>
) => {
  if (isCallback(prop)) {
    return prop(params);
  }
  return prop;
};

const evaluateClassName = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  className: PdfTable.CellClassName<R, M>,
  params: PdfTable.CellCallbackParams<R, M>
): (string | undefined)[] => {
  if (Array.isArray(className)) {
    const parts: (string | PdfTable.CellCallback<R, M> | PdfTable.CellClassName<R, M> | undefined)[] = className;
    return flatten(
      map(parts, (csName: string | PdfTable.CellCallback<R, M> | PdfTable.CellClassName<R, M> | undefined) =>
        evaluateClassName(csName, params)
      )
    );
  } else {
    return [evaluateOptionalCallbackProp<R, M>(className, params)];
  }
};

const evaluateCellStyle = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  styleObj: PdfTable.CellStyle<R, M>,
  params: PdfTable.CellCallbackParams<R, M>
): Style | undefined => {
  if (Array.isArray(styleObj)) {
    return reduce(
      styleObj,
      (obj: Style, newObj: PdfTable.CellStyle<R, M>) => ({
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
  readonly column: PdfTable.Column<R, M>;
  readonly row: Table.Row<R, M>;
  readonly location: PdfTable.CellLocation;
  readonly style?: PdfTable.CellStyle<R, M>;
  readonly className?: PdfTable.CellClassName<R, M>;
  readonly textStyle?: PdfTable.CellStyle<R, M>;
  readonly textClassName?: PdfTable.CellClassName<R, M>;
  readonly formatting?: boolean;
  readonly isHeader?: boolean;
  readonly debug?: boolean;
  readonly indented?: boolean;
  readonly border?: boolean;
  readonly cellContentsVisible?: PdfTable.OptionalCellCallback<R, M, boolean>;
  readonly valueCallback?: (params: Omit<PdfTable.CellCallbackParams<R, M>, "value" | "rawValue">) => any;
}

const Cell = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: CellProps<R, M>
): JSX.Element => {
  const callbackParams = useMemo<Omit<PdfTable.CellCallbackParams<R, M>, "value" | "rawValue">>(() => {
    return {
      location: props.location,
      row: props.row,
      column: props.column,
      isHeader: props.isHeader || false,
      indented: props.indented === true
    };
  }, [props.location, props.row, props.column, props.isHeader]);

  const rawValue = useMemo(() => {
    return !isNil(props.valueCallback)
      ? props.valueCallback(callbackParams)
      : props.row[props.column.field as keyof Table.Row<R, M>];
  }, [callbackParams, props.row, props.column]);

  const value = useMemo(() => {
    if (isNil(props.column.formatter) || props.formatting === false) {
      return rawValue;
    } else if (rawValue !== null) {
      return props.column.formatter(rawValue);
    }
    return "";
  }, [rawValue, props.column, props.formatting]);

  const fullCallbackParams = useMemo<PdfTable.CellCallbackParams<R, M>>(() => {
    return { ...callbackParams, rawValue, value };
  }, [rawValue, value, callbackParams]);

  const cellStyle = useMemo(() => {
    return {
      ...evaluateOptionalCallbackProp<R, M, Style>(
        props.isHeader === true ? props.column.headerCellProps?.style : props.column.cellProps?.style,
        fullCallbackParams
      ),
      width: `${props.column.width * 100.0}%`,
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
              ...(tabling.columns.getColumnTypeCSSStyle(props.column.columnType, {
                header: props.isHeader || false,
                pdf: true
              }) as Style),
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
