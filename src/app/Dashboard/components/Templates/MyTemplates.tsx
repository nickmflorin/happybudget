import React, { useEffect, useState } from "react";

import { isNil } from "lodash";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { ShowHide } from "components";
import { TemplateCard, EmptyCard } from "components/containers/cards";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { TemplateEmptyIcon } from "components/svgs";
import * as store from "application/store";

import { actions } from "../../store";

import GenericOwnedTemplate, { RenderGenericOwnedTemplateCardParams } from "./GenericOwnedTemplate";

interface MyTemplatesProps {
  readonly onDeriveBudget: (template: number) => void;
  readonly onCreateBudget: () => void;
}

const MyTemplates: React.FC<MyTemplatesProps> = ({
  onCreateBudget,
  onDeriveBudget,
}): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<number | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);

  const dispatch: Redux.Dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    dispatch(actions.requestTemplatesAction(null, {}));
  }, []);

  return (
    <React.Fragment>
      <GenericOwnedTemplate
        title="My Templates"
        selector={(s: Application.Store) => s.dashboard.templates}
        onSearch={(v: string) => dispatch(actions.setTemplatesSearchAction(v, {}))}
        noDataProps={{
          title: "You don't have any templates yet!",
          subTitle: "Create your own templates or choose one we curated in Discover.",
          button: {
            onClick: () => setCreateTempateModalOpen(true),
            text: "Create a Template",
          },
          child: <TemplateEmptyIcon />,
        }}
        onUpdatePagination={(p: Pagination) =>
          dispatch(actions.setTemplatesPaginationAction(p, {}))
        }
        onUpdateOrdering={(o: Redux.UpdateOrderingPayload) =>
          dispatch(actions.updateTemplatesOrderingAction(o, {}))
        }
        onCreate={onCreateBudget}
        onDeleted={(b: Model.SimpleTemplate) => {
          dispatch(actions.removeTemplateFromStateAction(b.id, {}));
          dispatch(
            store.actions.updateLoggedInUserMetricsAction(
              { metric: "num_templates", change: "decrement" },
              {},
            ),
          );
        }}
        lastCard={(budgets: Model.SimpleTemplate[]) => (
          <ShowHide show={budgets.length !== 0}>
            <EmptyCard
              className="template-empty-card"
              icon="plus"
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
            onDuplicated={(b: Model.Template) => {
              dispatch(
                store.actions.updateLoggedInUserMetricsAction(
                  { metric: "num_templates", change: "increment" },
                  {},
                ),
              );
              dispatch(actions.addTemplateToStateAction(b, {}));
            }}
            onMoved={() => {
              dispatch(actions.removeTemplateFromStateAction(params.budget.id, {}));
              dispatch(
                store.actions.updateLoggedInUserMetricsAction(
                  { metric: "num_templates", change: "decrement" },
                  {},
                ),
              );
            }}
          />
        )}
      />
      {!isNil(templateToEdit) && (
        <EditTemplateModal
          open={true}
          modelId={templateToEdit}
          onCancel={() => setTemplateToEdit(undefined)}
          onSuccess={(template: Model.Template) => {
            setTemplateToEdit(undefined);
            dispatch(actions.updateTemplateInStateAction({ id: template.id, data: template }, {}));
          }}
        />
      )}
      <CreateTemplateModal
        open={createTemplateModalOpen}
        onCancel={() => setCreateTempateModalOpen(false)}
        onSuccess={(template: Model.Template) => {
          setCreateTempateModalOpen(false);
          dispatch(actions.addTemplateToStateAction(template, {}));
          dispatch(
            store.actions.updateLoggedInUserMetricsAction(
              { metric: "num_templates", change: "increment" },
              {},
            ),
          );
          history.push(`/templates/${template.id}/accounts`);
        }}
      />
    </React.Fragment>
  );
};

export default MyTemplates;
