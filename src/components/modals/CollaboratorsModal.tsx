import { useEffect, useState } from "react";
import classNames from "classnames";

import * as api from "api";
import { ui, http } from "lib";

import { CollaboratorSelect } from "components/fields";
import { Modal } from "./generic";

type CollaboratorsModalProps = ModalProps & {
  readonly budgetId: number;
};

const CollaboratorsModal = ({ budgetId, ...props }: CollaboratorsModalProps): JSX.Element => {
  const [currentCollaborators, setCurrentCollaborators] = useState<Model.Collaborator[]>([]);
  const modal = ui.useModal();
  const [cancelToken] = http.useCancelToken();

  useEffect(() => {
    modal.current.setLoading(true);
    api
      .getCollaborators(budgetId, {}, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<Model.Collaborator>) => {
        modal.current.setLoading(false);
        setCurrentCollaborators(response.data);
      })
      .catch((e: Error) => {
        modal.current.setLoading(false);
        modal.current.handleRequestError(e);
      });
  }, [budgetId]);

  return (
    <Modal
      {...props}
      modal={modal}
      footer={null}
      title={"Collaborators"}
      className={classNames("collaborators-modal", props.className)}
    >
      <CollaboratorSelect currentCollaborators={currentCollaborators} />
    </Modal>
  );
};

export default CollaboratorsModal;
