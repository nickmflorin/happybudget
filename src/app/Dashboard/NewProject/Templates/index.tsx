import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { includes, map, filter, isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import { RenderWithSpinner } from "components";
import { CreateBudgetModal, EditTemplateModal } from "components/modals";
import { ModelSelectController } from "components/tables";

import {
  requestTemplatesAction,
  selectTemplatesAction,
  deleteTemplateAction,
  addBudgetToStateAction,
  updateTemplateInStateAction,
  selectAllTemplatesAction
} from "../../actions";
import TemplateCard from "./TemplateCard";
import "./index.scss";

const selectTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.data;
const selectSelectedTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.selected;
const selectDeletingTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.deleting;
const selectLoadingTemplates = (state: Redux.ApplicationStore) => state.dashboard.templates.loading;

const Templates = (): JSX.Element => {
  const [templateToDerive, setTemplateToDerive] = useState<number | undefined>(undefined);
  const [templateToEdit, setTemplateToEdit] = useState<Model.Template | undefined>(undefined);
  const [templatesToDelete, setTemplatesToDelete] = useState<Model.Template[] | undefined>(undefined);

  const dispatch: Dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const selected = useSelector(selectSelectedTemplates);
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
          <ModelSelectController<Model.Template>
            selected={selected}
            data={templates}
            entityName={"template"}
            checkable={true}
            style={{ marginLeft: 13 }}
            onCheckboxChange={() => dispatch(selectAllTemplatesAction(null))}
            items={[
              {
                actionName: "Delete",
                icon: <FontAwesomeIcon icon={faTrashAlt} />,
                onClick: (templs: Model.Template[]) => setTemplatesToDelete(templs)
              }
            ]}
          />
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
                  selected={includes(selected, template.id)}
                  onSelect={(checked: boolean) => {
                    if (checked === true) {
                      if (includes(selected, template.id)) {
                        /* eslint-disable no-console */
                        console.warn(
                          `Inconsistent state: Template ${template.id} unexpectedly in selected
                      templates state.`
                        );
                      } else {
                        dispatch(selectTemplatesAction([...selected, template.id]));
                      }
                    } else {
                      if (!includes(selected, template.id)) {
                        /* eslint-disable no-console */
                        console.warn(
                          `Inconsistent state: Template ${template.id} expected to be in selected
                      templates state but was not found.`
                        );
                      } else {
                        const ids = filter(selected, (id: number) => id !== template.id);
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
