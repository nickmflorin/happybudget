import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import * as store from "store";

import { ShowHide } from "components";
import { CommunityTemplateCard, CommunityTemplateStaffCard, EmptyCard } from "components/containers/cards";
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

  const dispatch: Redux.Dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(actions.requestCommunityAction(null));
  }, []);

  return (
    <React.Fragment>
      <GenericOwnedTemplate
        title={"Discover"}
        selector={(s: Application.Store) => s.dashboard.community}
        onSearch={(v: string) => dispatch(actions.setCommunitySearchAction(v, {}))}
        onUpdatePagination={(p: Pagination) => dispatch(actions.setCommunityPaginationAction(p))}
        onUpdateOrdering={(o: Redux.UpdateOrderingPayload) => dispatch(actions.updateCommunityOrderingAction(o))}
        onCreate={onCreateBudget}
        onDeleted={(b: Model.SimpleTemplate) => dispatch(actions.removeCommunityFromStateAction(b.id))}
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
              disabled={params.deleting}
              loading={params.deleting}
              onVisibilityToggled={(b: Model.Template) =>
                dispatch(actions.updateCommunityInStateAction({ id: params.budget.id, data: b }))
              }
              onEdit={() => history.push(`/templates/${params.budget.id}/accounts`)}
              onEditNameImage={() => setTemplateToEdit(params.budget.id)}
              onClick={() => onDeriveBudget(params.budget.id)}
              onDuplicated={(b: Model.Template) => dispatch(actions.addCommunityToStateAction(b))}
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
            modelId={templateToEdit}
            onCancel={() => setTemplateToEdit(undefined)}
            onSuccess={(template: Model.Template) => {
              setTemplateToEdit(undefined);
              dispatch(actions.updateCommunityInStateAction({ id: template.id, data: template }));
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
            dispatch(actions.addCommunityToStateAction(template));
            history.push(`/templates/${template.id}/accounts`);
          }}
        />
      </IsStaff>
    </React.Fragment>
  );
};

export default Discover;
