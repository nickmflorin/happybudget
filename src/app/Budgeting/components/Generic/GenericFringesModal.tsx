import { Modal } from "components/modals";
import GenericFringesTable, { GenericFringesTableProps } from "./GenericFringesTable";
import "./GenericFringesModal.scss";

export interface GenericFringesModalProps extends GenericFringesTableProps {
  onCancel: () => void;
  open: boolean;
  loading: boolean;
}

const GenericFringesModal = ({ open, onCancel, loading, ...props }: GenericFringesModalProps): JSX.Element => {
  return (
    <Modal
      className={"fringes-modal"}
      title={"Fringes"}
      loading={loading}
      visible={open}
      onCancel={() => onCancel()}
      footer={null}
    >
      <GenericFringesTable {...props} />
    </Modal>
  );
};

export default GenericFringesModal;
