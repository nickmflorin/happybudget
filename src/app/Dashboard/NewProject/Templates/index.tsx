import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, isNil } from "lodash";

import { RenderWithSpinner } from "components";
import { CreateBudgetModal, EditTemplateModal } from "components/modals";

import {
  requestTemplatesAction,
  deleteTemplateAction,
  addBudgetToStateAction,
  updateTemplateInStateAction
} from "../../actions";
import TemplateCard from "./TemplateCard";
import "./index.scss";

const selectTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.data;
const selectDeletingTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.deleting;
const selectLoadingTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.loading;

const Templates = (): JSX.Element => {
  const [templateToDerive, setTemplateToDerive] = useState<number | undefined>(undefined);
  const [templateToEdit, setTemplateToEdit] = useState<Model.Template | undefined>(undefined);

  const dispatch: Dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const deleting = useSelector(selectDeletingTemplates);
  const loading = useSelector(selectLoadingTemplates);

  const history = useHistory();

  useEffect(() => {
    dispatch(requestTemplatesAction(null));
  }, []);

  return (
    <div className={"templates"}>
      <RenderWithSpinner loading={loading}>
        <React.Fragment>
          <div className={"templates-grid"}>
            {map(templates, (template: Model.Template, index: number) => {
              return (
                <TemplateCard
                  key={index}
                  template={template}
                  loading={includes(
                    map(deleting, (instance: Redux.ModelListActionInstance) => instance.id),
                    template.id
                  )}
                  onEdit={() => setTemplateToEdit(template)}
                  onDelete={() => dispatch(deleteTemplateAction(template.id))}
                  onDerive={() => setTemplateToDerive(template.id)}
                />
              );
            })}
          </div>
        </React.Fragment>
      </RenderWithSpinner>
      {!isNil(templateToDerive) && (
        <CreateBudgetModal
          open={true}
          templateId={templateToDerive}
          onCancel={() => setTemplateToDerive(undefined)}
          onSuccess={(budget: Model.Budget) => {
            setTemplateToDerive(undefined);
            dispatch(addBudgetToStateAction(budget));
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
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
    </div>
  );
};

export default Templates;
