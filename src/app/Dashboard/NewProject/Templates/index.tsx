import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, filter, isNil } from "lodash";

import { CreateBudgetModal, EditTemplateModal } from "components/modals";

import {
  requestTemplatesAction,
  selectTemplatesAction,
  deleteTemplateAction,
  addBudgetToStateAction,
  updateTemplateInStateAction
} from "../../actions";
import TemplateCard from "./TemplateCard";
import "./index.scss";

const Templates = (): JSX.Element => {
  const [templateToDerive, setTemplateToDerive] = useState<number | undefined>(undefined);
  const [templateToEdit, setTemplateToEdit] = useState<Model.Template | undefined>(undefined);
  const dispatch: Dispatch = useDispatch();
  const templates = useSelector((state: Redux.ApplicationStore) => state.dashboard.templates);
  const history = useHistory();

  useEffect(() => {
    dispatch(requestTemplatesAction(null));
  }, []);

  return (
    <React.Fragment>
      <div className={"templates-grid"}>
        {map(templates.data, (template: Model.Template, index: number) => {
          return (
            <TemplateCard
              key={index}
              template={template}
              loading={includes(
                map(templates.deleting, (instance: Redux.ModelListActionInstance) => instance.id),
                template.id
              )}
              selected={includes(templates.selected, template.id)}
              onSelect={(checked: boolean) => {
                if (checked === true) {
                  if (includes(templates.selected, template.id)) {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state: Template ${template.id} unexpectedly in selected
                      templates state.`
                    );
                  } else {
                    dispatch(selectTemplatesAction([...templates.selected, template.id]));
                  }
                } else {
                  if (!includes(templates.selected, template.id)) {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state: Template ${template.id} expected to be in selected
                      templates state but was not found.`
                    );
                  } else {
                    const ids = filter(templates.selected, (id: number) => id !== template.id);
                    dispatch(selectTemplatesAction(ids));
                  }
                }
              }}
              onEdit={() => setTemplateToEdit(template)}
              onDelete={() => dispatch(deleteTemplateAction(template.id))}
              onDerive={() => setTemplateToDerive(template.id)}
            />
          );
        })}
      </div>
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
    </React.Fragment>
  );
};

export default Templates;
