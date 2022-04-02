import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import * as api from "api";
import * as store from "store";
import { redux, notifications } from "lib";

import { ShowHide } from "components";
import { CommunityTemplateCard, CommunityTemplateStaffCard, EmptyCard } from "components/containers";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { IsStaff } from "components/permissions";

import GenericOwnedTemplate, { RenderGenericOwnedTemplateCardParams } from "./GenericOwnedTemplate";

import { actions } from "../../store";

interface DiscoverProps {
  readonly onDeriveBudget: (template: number) => void;
  readonly onCreateBudget: () => void;
}

const Discover: React.FC<DiscoverProps> = ({ onCreateBudget, onDeriveBudget }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<number | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);
  const user = store.hooks.useLoggedInUser();

  const {
    isActive: isTogglingVisibility,
    addToState: setTogglingVisibility,
    removeFromState: setVisibilityToggled
  } = redux.useTrackModelActions([]);
  const {
    isActive: isDuplicating,
    removeFromState: setDuplicated,
    addToState: setDuplicating
  } = redux.useTrackModelActions([]);

  const dispatch: Redux.Dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(actions.requestTemplatesAction(null));
  }, []);

  return (
    <React.Fragment>
      <GenericOwnedTemplate
        title={"Discover"}
        selector={(s: Application.Store) => s.dashboard.community}
        onSearch={(v: string) => dispatch(actions.setCommunityTemplatesSearchAction(v, {}))}
        onUpdatePagination={(p: Pagination) => dispatch(actions.setCommunityTemplatesPaginationAction(p))}
        onUpdateOrdering={(o: Redux.UpdateOrderingPayload) =>
          dispatch(actions.updateCommunityTemplatesOrderingAction(o))
        }
        onCreate={onCreateBudget}
        onDeleted={(b: Model.SimpleTemplate) => dispatch(actions.removeCommunityTemplateFromStateAction(b.id))}
        lastCard={(budgets: Model.SimpleTemplate[]) => (
          <ShowHide show={budgets.length !== 0}>
            <EmptyCard
              className={"template-empty-card"}
              icon={"plus"}
              onClick={() => setCreateTempateModalOpen(true)}
            />
          </ShowHide>
        )}
        renderCard={(params: RenderGenericOwnedTemplateCardParams) => {
          /* The API will exclude hidden community templates for non-staff
							 users by design.  However, just in case we will also make sure
							 that we are not showing those templates to the user in the
							 frontend. */
          if (params.budget.hidden === true && user.is_staff === false) {
            console.error(
              "The API is returning hidden community templates for non-staff users!  This is a security problem!"
            );
          }
          let card: JSX.Element = (
            <CommunityTemplateStaffCard
              {...params}
              hidingOrShowing={isTogglingVisibility(params.budget.id)}
              duplicating={isDuplicating(params.budget.id)}
              disabled={params.deleting || isDuplicating(params.budget.id)}
              loading={params.deleting}
              onToggleVisibility={(e: MenuItemModelClickEvent) => {
                if (user.is_staff === false) {
                  throw new Error("Behavior prohibited for non-staff users.");
                }
                if (params.budget.hidden === true) {
                  setTogglingVisibility(params.budget.id);
                  api
                    .updateBudget<Model.Template>(params.budget.id, { hidden: false })
                    .then((response: Model.Template) => {
                      dispatch(actions.updateCommunityTemplateInStateAction({ id: params.budget.id, data: response }));
                      e.item.closeParentDropdown?.();
                    })
                    .catch((err: Error) => notifications.internal.handleRequestError(err))
                    .finally(() => setVisibilityToggled(params.budget.id));
                } else {
                  setTogglingVisibility(params.budget.id);
                  api
                    .updateBudget<Model.Template>(params.budget.id, { hidden: true })
                    .then((response: Model.Template) => {
                      dispatch(actions.updateCommunityTemplateInStateAction({ id: params.budget.id, data: response }));
                      e.item.closeParentDropdown?.();
                    })
                    .catch((err: Error) => notifications.internal.handleRequestError(err))
                    .finally(() => setVisibilityToggled(params.budget.id));
                }
              }}
              onEdit={() => history.push(`/templates/${params.budget.id}/accounts`)}
              onEditNameImage={() => setTemplateToEdit(params.budget.id)}
              onClick={() => onDeriveBudget(params.budget.id)}
              onDuplicate={(e: MenuItemModelClickEvent) => {
                setDuplicating(params.budget.id);
                api
                  /* We have to use a large timeout because this is a request
									   that sometimes takes a very long time. */
                  .duplicateBudget<Model.Template>(params.budget.id, { timeout: 120 * 1000 })
                  .then((response: Model.Template) => {
                    e.item.closeParentDropdown?.();
                    dispatch(actions.addCommunityTemplateToStateAction(response));
                  })
                  .catch((err: Error) => notifications.internal.handleRequestError(err))
                  .finally(() => setDuplicated(params.budget.id));
              }}
            />
          );
          if (user.is_staff !== true) {
            card = <CommunityTemplateCard {...params} onClick={() => onDeriveBudget(params.budget.id)} />;
          }
          if (params.budget.hidden === true) {
            return <IsStaff>{card}</IsStaff>;
          }
          return card;
        }}
      />
      {!isNil(templateToEdit) && (
        <IsStaff>
          <EditTemplateModal
            open={true}
            id={templateToEdit}
            onCancel={() => setTemplateToEdit(undefined)}
            onSuccess={(template: Model.Template) => {
              setTemplateToEdit(undefined);
              dispatch(actions.updateCommunityTemplateInStateAction({ id: template.id, data: template }));
            }}
          />
        </IsStaff>
      )}
      <IsStaff>
        <CreateTemplateModal
          open={createTemplateModalOpen}
          community={true}
          onCancel={() => setCreateTempateModalOpen(false)}
          onSuccess={(template: Model.Template) => {
            setCreateTempateModalOpen(false);
            dispatch(actions.addCommunityTemplateToStateAction(template));
            history.push(`/templates/${template.id}/accounts`);
          }}
        />
      </IsStaff>
    </React.Fragment>
  );
};

export default Discover;
