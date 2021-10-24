import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { map, isNil } from "lodash";

import * as api from "api";
import { redux, notifications } from "lib";

import { WrapInApplicationSpinner } from "components";
import { CommunityTemplateCard, EmptyCard } from "components/cards";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { IsStaff } from "components/permissions";

import { useLoggedInUser } from "store/hooks";

import { actions } from "../../store";

const selectTemplates = (state: Application.Authenticated.Store) => state.dashboard.community.data;
const selectLoadingTemplates = (state: Application.Authenticated.Store) => state.dashboard.community.loading;

interface DiscoverProps {
  setTemplateToDerive: (template: number) => void;
}

const Discover: React.FC<DiscoverProps> = ({ setTemplateToDerive }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<number | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);
  const user = useLoggedInUser();
  const [isDeleting, setDeleting, setDeleted] = redux.hooks.useTrackModelActions([]);
  const [isTogglingVisibility, setTogglingVisibility, setVisibilityToggled] = redux.hooks.useTrackModelActions([]);
  const [isDuplicating, setDuplicating, setDuplicated] = redux.hooks.useTrackModelActions([]);

  const dispatch: Redux.Dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const loading = useSelector(selectLoadingTemplates);

  const history = useHistory();

  useEffect(() => {
    dispatch(actions.requestCommunityTemplatesAction(null));
  }, []);

  return (
    <div className={"my-templates"}>
      <WrapInApplicationSpinner loading={loading}>
        <div className={"dashboard-card-grid"}>
          {map(templates, (template: Model.Template, index: number) => {
            // The API will exclude hidden community templates for non-staff users
            // by design.  However, just in case we will also make sure that we are
            // not showing those templates to the user in the frontend.
            if (template.hidden === true && user.is_staff === false) {
              console.error(
                "The API is returning hidden community templates for non-staff users!  This is a security problem!"
              );
            }
            const card = (
              <CommunityTemplateCard
                template={template}
                hidingOrShowing={isTogglingVisibility(template.id)}
                duplicating={isDuplicating(template.id)}
                deleting={isDeleting(template.id)}
                onToggleVisibility={(e: MenuItemClickEvent<MenuItemModel>) => {
                  if (user.is_staff === false) {
                    throw new Error("Behavior prohibited for non-staff users.");
                  }
                  if (template.hidden === true) {
                    setTogglingVisibility(template.id);
                    api
                      .updateTemplate(template.id, { hidden: false })
                      .then((response: Model.Template) => {
                        dispatch(actions.updateCommunityTemplateInStateAction({ id: template.id, data: response }));
                        e.closeParentDropdown?.();
                      })
                      .catch((err: Error) => notifications.requestError(err))
                      .finally(() => setVisibilityToggled(template.id));
                  } else {
                    setTogglingVisibility(template.id);
                    api
                      .updateTemplate(template.id, { hidden: true })
                      .then((response: Model.Template) => {
                        dispatch(actions.updateCommunityTemplateInStateAction({ id: template.id, data: response }));
                        e.closeParentDropdown?.();
                      })
                      .catch((err: Error) => notifications.requestError(err))
                      .finally(() => setVisibilityToggled(template.id));
                  }
                }}
                onEdit={() => history.push(`/templates/${template.id}/accounts`)}
                onEditNameImage={() => setTemplateToEdit(template.id)}
                onDelete={(e: MenuItemClickEvent<MenuItemModel>) => {
                  setDeleting(template.id);
                  api
                    .deleteTemplate(template.id)
                    .then(() => {
                      e.closeParentDropdown?.();
                      dispatch(actions.removeCommunityTemplateFromStateAction(template.id));
                    })
                    .catch((err: Error) => notifications.requestError(err))
                    .finally(() => setDeleted(template.id));
                }}
                onClick={() => setTemplateToDerive(template.id)}
                onDuplicate={(e: MenuItemClickEvent<MenuItemModel>) => {
                  setDuplicating(template.id);
                  api
                    .duplicateTemplate(template.id)
                    .then((response: Model.Template) => {
                      e.closeParentDropdown?.();
                      dispatch(actions.addCommunityTemplateToStateAction(response));
                    })
                    .catch((err: Error) => notifications.requestError(err))
                    .finally(() => setDuplicated(template.id));
                }}
              />
            );
            if (template.hidden === true) {
              return <IsStaff key={index}>{card}</IsStaff>;
            }
            return <React.Fragment key={index}>{card}</React.Fragment>;
          })}
          <IsStaff>
            <EmptyCard title={"New Community Template"} icon={"plus"} onClick={() => setCreateTempateModalOpen(true)} />
          </IsStaff>
        </div>
      </WrapInApplicationSpinner>
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
    </div>
  );
};

export default Discover;
