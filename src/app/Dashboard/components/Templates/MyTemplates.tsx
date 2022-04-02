import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { isNil } from "lodash";

import { ShowHide } from "components";
import { TemplateCard, EmptyCard } from "components/containers/cards";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { TemplateEmptyIcon } from "components/svgs";

import GenericOwnedTemplate, { RenderGenericOwnedTemplateCardParams } from "./GenericOwnedTemplate";

import { actions } from "../../store";

interface MyTemplatesProps {
  readonly onDeriveBudget: (template: number) => void;
  readonly onCreateBudget: () => void;
}

const MyTemplates: React.FC<MyTemplatesProps> = ({ onCreateBudget, onDeriveBudget }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<number | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);

  const dispatch: Redux.Dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(actions.requestTemplatesAction(null));
  }, []);

  return (
    <React.Fragment>
      <GenericOwnedTemplate
        title={"My Templates"}
        selector={(s: Application.Store) => s.dashboard.templates}
        onSearch={(v: string) => dispatch(actions.setTemplatesSearchAction(v, {}))}
        noDataProps={{
          title: "You don't have any templates yet!",
          subTitle: "Create your own templates or choose one we curated in Discover.",
          button: {
            onClick: () => setCreateTempateModalOpen(true),
            text: "Create a Template"
          },
          child: <TemplateEmptyIcon />
        }}
        onUpdatePagination={(p: Pagination) => dispatch(actions.setTemplatesPaginationAction(p))}
        onUpdateOrdering={(o: Redux.UpdateOrderingPayload) => dispatch(actions.updateTemplatesOrderingAction(o))}
        onCreate={onCreateBudget}
        onDeleted={(b: Model.SimpleTemplate) => dispatch(actions.removeTemplateFromStateAction(b.id))}
        lastCard={(budgets: Model.SimpleTemplate[]) => (
          <ShowHide show={budgets.length !== 0}>
            <EmptyCard
              className={"template-empty-card"}
              icon={"plus"}
              onClick={() => setCreateTempateModalOpen(true)}
            />
          </ShowHide>
        )}
        renderCard={(params: RenderGenericOwnedTemplateCardParams) => (
          <TemplateCard
            {...params}
            loading={params.deleting}
            disabled={params.deleting}
            onEdit={() => history.push(`/templates/${params.budget.id}/accounts`)}
            onEditNameImage={() => setTemplateToEdit(params.budget.id)}
            onClick={() => onDeriveBudget(params.budget.id)}
            onDuplicated={(b: Model.Template) => dispatch(actions.addTemplateToStateAction(b))}
            onMoved={(b: Model.Template) => {
              dispatch(actions.removeTemplateFromStateAction(params.budget.id));
              dispatch(actions.addTemplateToStateAction(b));
            }}
          />
        )}
      />
      {!isNil(templateToEdit) && (
        <EditTemplateModal
          open={true}
          id={templateToEdit}
          onCancel={() => setTemplateToEdit(undefined)}
          onSuccess={(template: Model.Template) => {
            setTemplateToEdit(undefined);
            dispatch(actions.updateTemplateInStateAction({ id: template.id, data: template }));
          }}
        />
      )}
      <CreateTemplateModal
        open={createTemplateModalOpen}
        onCancel={() => setCreateTempateModalOpen(false)}
        onSuccess={(template: Model.Template) => {
          setCreateTempateModalOpen(false);
          dispatch(actions.addTemplateToStateAction(template));
          history.push(`/templates/${template.id}/accounts`);
        }}
      />
    </React.Fragment>
  );
};

export default MyTemplates;
