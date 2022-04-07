import { useEffect, useState, useMemo } from "react";
import classNames from "classnames";
import { map, filter } from "lodash";

import * as api from "api";
import { ui, http, model, redux, util } from "lib";

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
  const { isActive: isDeleting, removeFromState: setDeleted, addToState: setDeleting } = redux.useTrackModelActions([]);
  const { isActive: isUpdating, removeFromState: setUpdated, addToState: setUpdating } = redux.useTrackModelActions([]);

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
          access_type: model.budgeting.CollaboratorAccessTypes.view_only.id
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
        <CollaboratorSelect
          wrapperStyle={{ marginRight: 15, flexGrow: 100 }}
          currentCollaborators={collaborators}
          onChange={(users: number[]) => setNewCollaboratorUsers(users)}
        />
        <PrimaryButton onClick={() => addCollaborators(newCollaboratorUsers)}>{"Add"}</PrimaryButton>
      </div>
      <CollaboratorsList
        collaborators={collaborators}
        style={{ marginTop: 15 }}
        isDeleting={isDeleting}
        isUpdating={isUpdating}
        onChangeAccessType={(m: Model.Collaborator, ac: Model.CollaboratorAccessType["id"]) => {
          setUpdating(m.id);
          api
            .updateCollaborator(m.id, { access_type: ac }, { cancelToken: cancelToken() })
            .then((c: Model.Collaborator) => {
              setUpdated(c.id);
              setCollaborators(util.replaceInArray(collaborators, { id: m.id }, c));
            })
            .catch((e: Error) => {
              setUpdated(m.id);
              modal.current.handleRequestError(e);
            });
        }}
        onRemoveCollaborator={(m: Model.Collaborator) => {
          setDeleting(m.id);
          api
            .deleteCollaborator(m.id, { cancelToken: cancelToken() })
            .then(() => {
              setDeleted(m.id);
              setCollaborators(filter(collaborators, (c: Model.Collaborator) => c.id !== m.id));
            })
            .catch((e: Error) => {
              setDeleted(m.id);
              modal.current.handleRequestError(e);
            });
        }}
      />
    </Modal>
  );
};

export default CollaboratorsModal;
