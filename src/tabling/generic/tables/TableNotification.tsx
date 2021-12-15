import { isNil } from "lodash";

const TableNotification = (props: TableNotification) => {
  return (
    <div className={"table-notification"}>
      <div className={"table-notification-header"}>
        <div className={"message"}>{props.message}</div>
      </div>
      {!isNil(props.detail) && (
        <div className={"table-notification-content"}>
          <div className={"detail"}>{props.detail}</div>
        </div>
      )}
    </div>
  );
};

export default TableNotification;
