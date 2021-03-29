import { filter } from "lodash";
import { ICellRendererParams } from "ag-grid-community";
import { CloseCircleOutlined } from "@ant-design/icons";

type Func = (props: any) => JSX.Element;

/**
 * @param func  Wraps a React component for creating a table cell such that the
 *              cell will only be rendered if the row does not correspond to
 *              a group footer.
 * @returns    (props: any) => JSX.Element
 */
export const HideCellForGroupFooter = <R extends Table.Row<any, any>>(func: Func): Func => {
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
export const HideCellForTableFooter = <R extends Table.Row<any, any>>(func: Func): Func => {
  return (ps: ICellRendererParams): JSX.Element => {
    const row: R = ps.data;
    if (row.meta.isTableFooter) {
      return <></>;
    }
    const Component = func;
    return <Component {...ps} />;
  };
};

export const IncludeErrorsInCell = <R extends Table.Row<any, any>>(func: Func): Func => {
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

const defaultExport = {
  IncludeErrorsInCell: IncludeErrorsInCell,
  HideCellForGroupFooter: HideCellForGroupFooter
};

export default defaultExport;
