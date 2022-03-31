import { useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import { map, filter } from "lodash";

import * as api from "api";
import { ui, http, model } from "lib";

import { PrimaryButton } from "components/buttons";
import { CollaboratorsList } from "components/collaboration";
import { CollaboratorSelect } from "components/fields";

import { Modal } from "./generic";

type CollaboratorsModalProps = ModalProps & {
  readonly budgetId: number;
};

const CollaboratorsModal = ({ budgetId, ...props }: CollaboratorsModalProps): JSX.Element => {
  const [collaborators, setCollaborators] = useState<Model.Collaborator[]>([]);
  const [newCollaboratorUsers, setNewCollaboratorUsers] = useState<number[]>([]);

  const modal = ui.useModal();
  const [cancelToken] = http.useCancelToken();

  useEffect(() => {
    modal.current.setLoading(true);
    api
      .getCollaborators(budgetId, {}, { cancelToken: cancelToken() })
      .then((response: Http.ListResponse<Model.Collaborator>) => {
        modal.current.setLoading(false);
        setCollaborators(response.data);
      })
      .catch((e: Error) => {
        modal.current.setLoading(false);
        modal.current.handleRequestError(e);
      });
  }, [budgetId]);

  const addCollaborators = useMemo(
    () => (ids: number[]) => {
      const promises: Promise<Model.Collaborator>[] = map(ids, (id: number) =>
        api.createCollaborator(budgetId, {
          user: id,
          access_type: model.budgeting.CollaboratorAccessTypes["View Only"].id
        })
      );
      modal.current.setLoading(true);
      Promise.all(promises)
        .then((data: Model.Collaborator[]) => {
          modal.current.setLoading(false);
          setCollaborators([...collaborators, ...data]);
          setNewCollaboratorUsers([]);
        })
        .catch((e: Error) => {
          modal.current.setLoading(false);
          modal.current.handleRequestError(e);
        });
    },
    [budgetId, collaborators, modal.current]
  );

  return (
    <Modal
      {...props}
      modal={modal}
      footer={null}
      title={"Collaborators"}
      className={classNames("collaborators-modal", props.className)}
    >
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: 15, flexGrow: 100 }}>
          <CollaboratorSelect
            currentCollaborators={collaborators}
            onChange={(ids: number[]) => setNewCollaboratorUsers(ids)}
          />
        </div>
        <PrimaryButton onClick={() => addCollaborators(newCollaboratorUsers)}>{"Add"}</PrimaryButton>
      </div>
      <CollaboratorsList
        collaborators={collaborators}
        style={{ marginTop: 15 }}
        onRemoveCollaborator={(m: Model.Collaborator) => {
          /* TODO: Display loading indicator in specific line item and give the
             line item less opacity. */
          modal.current.setLoading(true);
          api
            .deleteCollaborator(m.id)
            .then(() => {
              modal.current.setLoading(false);
              setCollaborators(filter(collaborators, (c: Model.Collaborator) => c.id !== m.id));
            })
            .catch((e: Error) => {
              modal.current.setLoading(false);
              modal.current.handleRequestError(e);
            });
        }}
      />
    </Modal>
  );
};

export default CollaboratorsModal;
