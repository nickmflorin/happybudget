import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, isNil } from "lodash";

import { RenderWithSpinner } from "components";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { IsStaff } from "components/permissions";
import { useLoggedInUser } from "store/hooks";

import * as actions from "../../store/actions";
import { CommunityTemplateCard, EmptyCard } from "../Card";

const selectTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.data;
const selectLoadingTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.loading;
const selectDuplicatingTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.duplicating;
const selectDeletingTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.deleting;
const selectHidingTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.hiding;
const selectShowingTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.showing;

interface DiscoverProps {
  setTemplateToDerive: (template: number) => void;
}

const Discover: React.FC<DiscoverProps> = ({ setTemplateToDerive }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<Model.Template | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);
  const user = useLoggedInUser();

  const dispatch: Dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const loading = useSelector(selectLoadingTemplates);
  const duplicating = useSelector(selectDuplicatingTemplates);
  const deleting = useSelector(selectDeletingTemplates);
  const showing = useSelector(selectShowingTemplates);
  const hiding = useSelector(selectHidingTemplates);

  const history = useHistory();

  useEffect(() => {
    dispatch(actions.requestCommunityTemplatesAction(null));
  }, []);

  return (
    <div className={"my-templates"}>
      <RenderWithSpinner loading={loading}>
        <React.Fragment>
          <div className={"dashboard-card-grid"}>
            <IsStaff>
              <EmptyCard
                title={"New Community Template"}
                icon={"plus"}
                onClick={() => setCreateTempateModalOpen(true)}
              />
            </IsStaff>
            {map(templates, (template: Model.Template, index: number) => {
              // The API will exclude hidden community templates for non-staff users
              // by design.  However, just in case we will also make sure that we are
              // not showing those templates to the user in the frontend.
              if (template.hidden === true && user.is_staff === false) {
                /* eslint-disable no-console */
                console.error(
                  "The API is returning hidden community templates for non-staff users!  This is a security problem!"
                );
              }
              const card = (
                <CommunityTemplateCard
                  key={index}
                  template={template}
                  hidingOrShowing={
                    includes(
                      map(hiding, (instance: Redux.ModelListActionInstance) => instance.id),
                      template.id
                    ) ||
                    includes(
                      map(showing, (instance: Redux.ModelListActionInstance) => instance.id),
                      template.id
                    )
                  }
                  duplicating={includes(
                    map(duplicating, (instance: Redux.ModelListActionInstance) => instance.id),
                    template.id
                  )}
                  deleting={includes(
                    map(deleting, (instance: Redux.ModelListActionInstance) => instance.id),
                    template.id
                  )}
                  onToggleVisibility={() => {
                    if (user.is_staff === false) {
                      throw new Error("Behavior prohibited for non-staff users.");
                    }
                    if (template.hidden === true) {
                      dispatch(actions.showCommunityTemplateAction(template.id));
                    } else {
                      dispatch(actions.hideCommunityTemplateAction(template.id));
                    }
                  }}
                  onEdit={() => history.push(`/templates/${template.id}/accounts`)}
                  onEditNameImage={() => setTemplateToEdit(template)}
                  onDelete={() => dispatch(actions.deleteCommunityTemplateAction(template.id))}
                  onClick={() => setTemplateToDerive(template.id)}
                  onDuplicate={() => dispatch(actions.duplicateCommunityTemplateAction(template.id))}
                />
              );
              if (template.hidden === true) {
                return <IsStaff>{card}</IsStaff>;
              }
              return card;
            })}
          </div>
        </React.Fragment>
      </RenderWithSpinner>
      {!isNil(templateToEdit) && (
        <IsStaff>
          <EditTemplateModal
            open={true}
            template={templateToEdit}
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
