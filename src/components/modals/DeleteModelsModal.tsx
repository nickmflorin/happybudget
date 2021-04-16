import React from "react";
import { isNil } from "lodash";

import { List } from "antd";
import { ModalProps } from "antd/lib/modal";

import { Warning, Info } from "components/feedback";
import DeleteModelListItem, { DeleteModelListItemProps } from "./DeleteModelListItem";
import Modal from "./Modal";

interface DeleteModelsModalProps<M> extends ModalProps {
  loading?: boolean;
  info?: string;
  warning?: string;
  confirm?: string;
  dataSource: M[];
  itemProps: (item: M) => DeleteModelListItemProps;
}

const DeleteModelsModal = <M extends Model.Model>({
  loading,
  info,
  warning,
  confirm,
  dataSource,
  itemProps,
  ...props
}: DeleteModelsModalProps<M>): JSX.Element => {
  return (
    <Modal loading={loading} {...props}>
      <React.Fragment>
        {!isNil(info) && <Info style={{ marginBottom: 24 }} detail={info} />}
        {!isNil(warning) && <Warning style={{ marginBottom: 24 }} detail={warning} />}
        {!isNil(confirm) && <div style={{ marginBottom: 16 }}>{confirm}</div>}
        <List
          itemLayout={"horizontal"}
          dataSource={dataSource}
          renderItem={(item: any) => <DeleteModelListItem {...itemProps(item)} />}
        />
      </React.Fragment>
    </Modal>
  );
};

export default DeleteModelsModal;
