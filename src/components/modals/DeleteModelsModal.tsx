import React from "react";
import { isNil } from "lodash";

import { List } from "antd";
import { ModalProps } from "antd/lib/modal";

import { DisplayAlert } from "components";
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
        {!isNil(info) && <DisplayAlert style={{ marginBottom: 24 }} type={"info"} description={info} />}
        {!isNil(warning) && <DisplayAlert style={{ marginBottom: 24 }} type={"warning"} description={warning} />}
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
