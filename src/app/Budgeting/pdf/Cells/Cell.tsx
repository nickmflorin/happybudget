import { useMemo } from "react";
import { Style } from "@react-pdf/types";
import classNames from "classnames";
import { isNil, map, flatten } from "lodash";

import { ShowHide } from "components";
import { View, Text } from "components/pdf";
import { getColumnTypeCSSStyle } from "lib/model/util";

const isCallback = <R extends Table.PdfRow, M extends Model.Model, T = any>(
  prop: Table.OptionalPdfCellCallback<R, M, T>
): prop is Table.PdfCellCallback<R, M, T> => {
  return typeof prop === "function";
};

const evaluateOptionalCallbackProp = <R extends Table.PdfRow, M extends Model.Model, T = any>(
  /* eslint-disable indent */
  prop: Table.OptionalPdfCellCallback<R, M, T> | undefined,
  params: Table.PdfCellCallbackParams<R, M>
) => {
  if (isCallback(prop)) {
    return prop(params);
  }
  return prop;
};

const evaluateClassName = <R extends Table.PdfRow, M extends Model.Model>(
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
    return [evaluateOptionalCallbackProp(className, params)];
  }
};

export interface CellProps<R extends Table.PdfRow, M extends Model.Model> {
  readonly column: Table.PdfColumn<R, M>;
  readonly row: R;
  readonly location: Table.PdfCellLocation;
  readonly style?: Table.OptionalPdfCellCallback<R, M, Style>;
  readonly className?: Table.PdfCellClassName<R, M>;
  readonly textStyle?: Table.OptionalPdfCellCallback<R, M, Style>;
  readonly textClassName?: Table.PdfCellClassName<R, M>;
  readonly formatting?: boolean;
  readonly isHeader?: boolean;
  readonly debug?: boolean;
  readonly border?: boolean;
  readonly cellContentsVisible?: Table.OptionalPdfCellCallback<R, M, boolean>;
  readonly valueCallback?: (params: Omit<Table.PdfCellCallbackParams<R, M>, "value" | "rawValue">) => any;
}

const Cell = <R extends Table.PdfRow, M extends Model.Model>(props: CellProps<R, M>): JSX.Element => {
  const callbackParams = useMemo(() => {
    return {
      location: props.location,
      row: props.row,
      column: props.column,
      isHeader: props.isHeader || false
    };
  }, [props.location, props.row, props.column, props.isHeader]);

  const rawValue = useMemo(() => {
    return !isNil(props.valueCallback) ? props.valueCallback(callbackParams) : props.row[props.column.field as keyof R];
  }, [callbackParams, props.row, props.column]);

  const value = useMemo(() => {
    if (isNil(props.column.formatter) || props.formatting === false) {
      return rawValue;
    } else if (rawValue !== null) {
      return props.column.formatter(rawValue);
    }
    return "";
  }, [rawValue, props.column, props.formatting]);

  const fullCallbackParams = useMemo(() => {
    return { ...callbackParams, rawValue, value };
  }, [rawValue, value, callbackParams]);

  const cellStyle = useMemo(() => {
    let cStyle = evaluateOptionalCallbackProp<R, M, Style>(
      props.isHeader === true ? props.column.headerCellProps?.style : props.column.cellProps?.style,
      fullCallbackParams
    );
    if (!isNil(props.column.width)) {
      if (typeof props.column.width === "number") {
        cStyle = { ...cStyle, width: `${props.column.width}px` };
      } else {
        cStyle = { ...cStyle, width: props.column.width };
      }
    }
    return {
      ...cStyle,
      ...evaluateOptionalCallbackProp<R, M, Style>(props.style, fullCallbackParams)
    };
  }, [props.column]);

  return (
    <View
      className={classNames(
        evaluateOptionalCallbackProp<R, M, string>(
          props.isHeader === true ? props.column.headerCellProps?.className : props.column.cellProps?.className,
          fullCallbackParams
        ),
        evaluateClassName<R, M>(props.className, fullCallbackParams),
        { "no-border": props.border === false }
      )}
      style={cellStyle}
      debug={props.debug}
    >
      <ShowHide
        hide={
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
              ...(getColumnTypeCSSStyle(props.column.type, { header: props.isHeader || false, pdf: true }) as Style),
              ...evaluateOptionalCallbackProp<R, M, Style>(
                props.isHeader === true ? props.column.headerCellProps?.textStyle : props.column.cellProps?.textStyle,
                fullCallbackParams
              ),
              ...evaluateOptionalCallbackProp<R, M, Style>(props.textStyle, fullCallbackParams)
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
