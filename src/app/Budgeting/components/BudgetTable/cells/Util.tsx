import { filter } from "lodash";
import { ICellRendererParams } from "@ag-grid-community/core";
import { CloseCircleOutlined } from "@ant-design/icons";

type Func = (props: any) => JSX.Element;

/**
 * @param func  Wraps a React component for creating a table cell such that the
 *              cell will only be rendered if the row does not correspond to
 *              a group footer.
 * @returns    (props: any) => JSX.Element
 */
export const HideCellForGroupFooter = <R extends Table.Row>(func: Func): Func => {
  return (ps: ICellRendererParams): JSX.Element => {
    const row: R = ps.data;
    if (row.meta.isGroupFooter) {
      return <></>;
    }
    const Component = func;
    return <Component {...ps} />;
  };
};

/**
 * @param func  Wraps a React component for creating a table cell such that the
 *              cell will only be rendered if the row does not correspond to
 *              a table footer.
 * @returns    (props: any) => JSX.Element
 */
export const HideCellForTableFooter = <R extends Table.Row>(func: Func): Func => {
  return (ps: ICellRendererParams): JSX.Element => {
    const row: R = ps.data;
    if (row.meta.isTableFooter) {
      return <></>;
    }
    const Component = func;
    return <Component {...ps} />;
  };
};

/**
 * @param func  Wraps a React component for creating a table cell such that the
 *              cell will only be rendered if the row does not correspond to
 *              a budget footer.
 * @returns    (props: any) => JSX.Element
 */
export const HideCellForBudgetFooter = <R extends Table.Row>(func: Func): Func => {
  return (ps: ICellRendererParams): JSX.Element => {
    const row: R = ps.data;
    if (row.meta.isBudgetFooter) {
      return <></>;
    }
    const Component = func;
    return <Component {...ps} />;
  };
};

/**
 * @param func  Wraps a React component for creating a table cell such that the
 *              cell will only be rendered if the row does not correspond to
 *              a budget footer.
 * @returns    (props: any) => JSX.Element
 */
export const HideCellForAllFooters = <R extends Table.Row>(func: Func): Func => {
  return (ps: ICellRendererParams): JSX.Element => {
    const row: R = ps.data;
    if (row.meta.isBudgetFooter || row.meta.isGroupFooter || row.meta.isTableFooter) {
      return <></>;
    }
    const Component = func;
    return <Component {...ps} />;
  };
};

export const IncludeErrorsInCell = <R extends Table.Row>(func: Func): Func => {
  return ({ colDef, data, ...props }: ICellRendererParams): JSX.Element => {
    const row: R = data;
    const Component = func;
    // TODO: I'm not sure if this will properly rerender if new cell errors appear.
    // We need to investigate this.
    const cellErrors = filter(
      row.meta.errors,
      (error: Table.CellError) => error.field === colDef.field && error.id === row.id
    );
    if (cellErrors.length !== 0) {
      return (
        <div>
          <div className={"error-container"}>
            <CloseCircleOutlined className={"icon--error"} />
            <div className={"text-error"}>{cellErrors[0].error}</div>
          </div>
          <Component colDef={colDef} data={data} {...props} />
        </div>
      );
    }
    return <Component colDef={colDef} data={data} {...props} />;
  };
};

/**
 * @param func  Wraps a React component for creating a table cell such that the
 *              cell will only be rendered if the row has the provided type.
 * @returns    (props: any) => JSX.Element
 */
export const ShowCellOnlyForRowType = <R extends Table.Row>(rowType: Table.RowType) => (func: Func): Func => {
  return (ps: ICellRendererParams): JSX.Element => {
    const row: R = ps.data;
    if (row.meta.type !== rowType) {
      return <></>;
    }
    const Component = func;
    return <Component {...ps} />;
  };
};

const defaultExport = {
  IncludeErrorsInCell,
  HideCellForGroupFooter,
  HideCellForAllFooters,
  HideCellForBudgetFooter,
  HideCellForTableFooter,
  ShowCellOnlyForRowType
};

export default defaultExport;
