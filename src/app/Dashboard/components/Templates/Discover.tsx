import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, isNil } from "lodash";

import { RenderWithSpinner } from "components";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { IsStaff } from "components/permissions";

import {
  requestCommunityTemplatesAction,
  deleteCommunityTemplateAction,
  updateCommunityTemplateInStateAction,
  addCommunityTemplateToStateAction,
  duplicateCommunityTemplateAction
} from "../../store/actions";
import { CommunityTemplateCard, EmptyCard } from "../Card";

const selectTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.data;
const selectLoadingTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.loading;
const selectDuplicatingTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.duplicating;
const selectDeletingTemplates = (state: Redux.ApplicationStore) => state.dashboard.community.deleting;

interface DiscoverProps {
  setTemplateToDerive: (template: number) => void;
}

const Discover: React.FC<DiscoverProps> = ({ setTemplateToDerive }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<Model.Template | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);

  const dispatch: Dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const loading = useSelector(selectLoadingTemplates);
  const duplicating = useSelector(selectDuplicatingTemplates);
  const deleting = useSelector(selectDeletingTemplates);

  const history = useHistory();

  useEffect(() => {
    dispatch(requestCommunityTemplatesAction(null));
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
              return (
                <CommunityTemplateCard
                  key={index}
                  template={template}
                  duplicating={includes(
                    map(duplicating, (instance: Redux.ModelListActionInstance) => instance.id),
                    template.id
                  )}
                  deleting={includes(
                    map(deleting, (instance: Redux.ModelListActionInstance) => instance.id),
                    template.id
                  )}
                  onEdit={() => history.push(`/templates/${template.id}/accounts`)}
                  onEditNameImage={() => setTemplateToEdit(template)}
                  onDelete={() => dispatch(deleteCommunityTemplateAction(template.id))}
                  onClick={() => setTemplateToDerive(template.id)}
                  onDuplicate={() => dispatch(duplicateCommunityTemplateAction(template.id))}
                />
              );
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
              dispatch(updateCommunityTemplateInStateAction({ id: template.id, data: template }));
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
            dispatch(addCommunityTemplateToStateAction(template));
            history.push(`/templates/${template.id}/accounts`);
          }}
        />
      </IsStaff>
    </div>
  );
};

export default Discover;
