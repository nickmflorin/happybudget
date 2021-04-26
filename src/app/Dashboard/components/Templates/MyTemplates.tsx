import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, isNil } from "lodash";

import { RenderWithSpinner } from "components";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";

import {
  requestTemplatesAction,
  deleteTemplateAction,
  updateTemplateInStateAction,
  addTemplateToStateAction,
  moveTemplateToCommunityAction,
  duplicateTemplateAction
} from "../../store/actions";
import { TemplateCard, EmptyCard } from "../Card";

const selectTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.data;
const selectLoadingTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.loading;
const selectDuplicatingTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.duplicating;
const selectMovingTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.moving;
const selectDeletingTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.deleting;

interface MyTemplatesProps {
  setTemplateToDerive: (template: number) => void;
}

const MyTemplates: React.FC<MyTemplatesProps> = ({ setTemplateToDerive }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<Model.Template | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);

  const dispatch: Dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const loading = useSelector(selectLoadingTemplates);
  const duplicating = useSelector(selectDuplicatingTemplates);
  const moving = useSelector(selectMovingTemplates);
  const deleting = useSelector(selectDeletingTemplates);

  const history = useHistory();

  useEffect(() => {
    dispatch(requestTemplatesAction(null));
  }, []);

  return (
    <div className={"my-templates"}>
      <RenderWithSpinner loading={loading}>
        <React.Fragment>
          <div className={"dashboard-card-grid"}>
            <EmptyCard title={"New Template"} icon={"plus"} onClick={() => setCreateTempateModalOpen(true)} />
            {map(templates, (template: Model.Template, index: number) => {
              return (
                <TemplateCard
                  key={index}
                  template={template}
                  duplicating={includes(
                    map(duplicating, (instance: Redux.ModelListActionInstance) => instance.id),
                    template.id
                  )}
                  moving={includes(
                    map(moving, (instance: Redux.ModelListActionInstance) => instance.id),
                    template.id
                  )}
                  deleting={includes(
                    map(deleting, (instance: Redux.ModelListActionInstance) => instance.id),
                    template.id
                  )}
                  onEdit={() => history.push(`/templates/${template.id}/accounts`)}
                  onEditNameImage={() => setTemplateToEdit(template)}
                  onDelete={() => dispatch(deleteTemplateAction(template.id))}
                  onClick={() => setTemplateToDerive(template.id)}
                  onMoveToCommunity={() => dispatch(moveTemplateToCommunityAction(template.id))}
                  onDuplicate={() => dispatch(duplicateTemplateAction(template.id))}
                />
              );
            })}
          </div>
        </React.Fragment>
      </RenderWithSpinner>
      {!isNil(templateToEdit) && (
        <EditTemplateModal
          open={true}
          template={templateToEdit}
          onCancel={() => setTemplateToEdit(undefined)}
          onSuccess={(template: Model.Template) => {
            setTemplateToEdit(undefined);
            dispatch(updateTemplateInStateAction({ id: template.id, data: template }));
          }}
        />
      )}
      <CreateTemplateModal
        open={createTemplateModalOpen}
        onCancel={() => setCreateTempateModalOpen(false)}
        onSuccess={(template: Model.Template) => {
          setCreateTempateModalOpen(false);
          dispatch(addTemplateToStateAction(template));
          history.push(`/templates/${template.id}/accounts`);
        }}
      />
    </div>
  );
};

export default MyTemplates;
