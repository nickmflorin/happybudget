import { Modal } from "components";
import { FringesTable, FringesTableProps } from "components/tabling";
import "./GenericFringesModal.scss";

export interface GenericFringesModalProps extends FringesTableProps {
  readonly onCancel: () => void;
  readonly open: boolean;
  readonly loading: boolean;
  readonly saving: boolean;
}

const GenericFringesModal = ({ open, onCancel, saving, loading, ...props }: GenericFringesModalProps): JSX.Element => {
  return (
    <Modal.Modal
      className={"fringes-modal"}
      title={"Fringes"}
      loading={loading}
      visible={open}
      onCancel={() => onCancel()}
      footer={null}
    >
      <FringesTable {...props} saving={saving} />
    </Modal.Modal>
  );
};

export default GenericFringesModal;
