import classNames from "classnames";
import { isNil } from "lodash";

import { WrapInApplicationSpinner, ShowHide } from "components";

export interface TableWrapperProps {
  readonly children: JSX.Element;
  readonly loading?: boolean | undefined;
  readonly menuPortalId?: string | undefined;
  readonly minimal?: boolean | undefined;
  readonly className?: Table.GeneralClassName;
  readonly footer?: JSX.Element;
}

const TableWrapper = (props: TableWrapperProps) => {
  return (
    <WrapInApplicationSpinner hideWhileLoading={false} loading={props.loading}>
      <div className={classNames("table", { "table--minimal": props.minimal }, props.className)}>
        <div
          className={classNames("core-table", {
            "with-page-footer": !isNil(props.footer),
            "with-table-menu": isNil(props.menuPortalId)
          })}
        >
          {props.children}
        </div>
        <ShowHide show={!isNil(props.footer)}>
          <div className={"page-footer-grid-wrapper"}>
            <div style={{ flexGrow: 100 }}></div>
            {props.footer}
          </div>
        </ShowHide>
      </div>
    </WrapInApplicationSpinner>
  );
};

export default TableWrapper;
