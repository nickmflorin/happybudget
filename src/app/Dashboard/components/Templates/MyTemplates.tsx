import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { map, isNil } from "lodash";

import * as api from "api";
import { redux, notifications } from "lib";

import { ShowHide, Icon, Pagination } from "components";
import { PrimaryButtonIconToggle, OrderingButtonIconToggle } from "components/buttons";
import { TemplateCard, EmptyCard } from "components/cards";
import { OrderingDropdown } from "components/dropdowns";
import { NoData } from "components/empty";
import { SearchInput } from "components/fields";
import { Page } from "components/layout";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { TemplateEmptyIcon } from "components/svgs";

import { actions } from "../../store";

const selectTemplates = (state: Application.AuthenticatedStore) => state.dashboard.templates.data;
const selectResponseWasReceived = (state: Application.AuthenticatedStore) =>
  state.dashboard.templates.responseWasReceived;
const selectLoading = (state: Application.AuthenticatedStore) => state.dashboard.templates.loading;
const selectPage = (state: Application.AuthenticatedStore) => state.dashboard.templates.page;
const selectPageSize = (state: Application.AuthenticatedStore) => state.dashboard.templates.pageSize;
const selectCount = (state: Application.AuthenticatedStore) => state.dashboard.templates.count;
const selectSearch = (state: Application.AuthenticatedStore) => state.dashboard.templates.search;
const selectOrdering = (state: Application.AuthenticatedStore) => state.dashboard.templates.ordering;

interface MyTemplatesProps {
  readonly setTemplateToDerive: (template: number) => void;
  readonly setCreateBudgetModalOpen: (v: boolean) => void;
}

const MyTemplates: React.FC<MyTemplatesProps> = ({ setCreateBudgetModalOpen, setTemplateToDerive }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<number | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);
  const [isDeleting, setDeleting, setDeleted] = redux.hooks.useTrackModelActions([]);
  const [isMoving, setMoving, setMoved] = redux.hooks.useTrackModelActions([]);
  const [isDuplicating, setDuplicating, setDuplicated] = redux.hooks.useTrackModelActions([]);

  const dispatch: Redux.Dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const loading = useSelector(selectLoading);
  const responseWasReceived = useSelector(selectResponseWasReceived);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const count = useSelector(selectCount);
  const search = useSelector(selectSearch);
  const ordering = useSelector(selectOrdering);

  const history = useHistory();

  useEffect(() => {
    dispatch(actions.requestTemplatesAction(null));
  }, []);

  return (
    <React.Fragment>
      <Page
        className={"my-templates"}
        pageProps={{ className: "dashboard-page" }}
        title={"My Templates"}
        loading={loading}
        subMenu={[
          <SearchInput
            key={1}
            placeholder={"Search Templates..."}
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(actions.setTemplatesSearchAction(event.target.value, {}))
            }
          />,
          <PrimaryButtonIconToggle
            key={2}
            icon={<Icon icon={"plus"} weight={"regular"} />}
            onClick={() => setCreateBudgetModalOpen(true)}
            text={"New Blank Budget"}
            breakpoint={"medium"}
          />,
          <OrderingDropdown
            key={3}
            ordering={ordering}
            onChange={(field: string, order: Http.Order) =>
              dispatch(actions.updateTemplatesOrderingAction({ field, order }))
            }
            models={[
              { id: "created_at", icon: "bars-sort", label: "Created" },
              { id: "updated_at", icon: "timer", label: "Last Updated" },
              { id: "name", icon: "sort-alpha-down", label: "Name" }
            ]}
          >
            <OrderingButtonIconToggle
              breakpoint={"medium"}
              ordering={ordering}
              labelMap={{
                created_at: "Created",
                updated_at: "Last Updated",
                name: "Name"
              }}
            />
          </OrderingDropdown>
        ]}
        contentScrollable={true}
      >
        {templates.length === 0 && responseWasReceived ? (
          <NoData
            title={"You don't have any templates yet!"}
            subTitle={"Create your own templates or choose one we curated in Discover."}
            button={{
              onClick: () => setCreateTempateModalOpen(true),
              text: "Create a Template"
            }}
            icon={<Icon icon={"plus"} weight={"light"} />}
          >
            <TemplateEmptyIcon />
          </NoData>
        ) : (
          <div className={"dashboard-card-grid"}>
            {map(templates, (template: Model.Template, index: number) => {
              return (
                <TemplateCard
                  key={index}
                  template={template}
                  duplicating={isDuplicating(template.id)}
                  moving={isMoving(template.id)}
                  deleting={isDeleting(template.id)}
                  loading={isDeleting(template.id)}
                  disabled={isDeleting(template.id) || isMoving(template.id) || isDuplicating(template.id)}
                  onEdit={() => history.push(`/templates/${template.id}/accounts`)}
                  onEditNameImage={() => setTemplateToEdit(template.id)}
                  onDelete={(e: MenuItemModelClickEvent) => {
                    setDeleting(template.id);
                    api
                      .deleteTemplate(template.id)
                      .then(() => {
                        e.closeParentDropdown?.();
                        dispatch(actions.removeTemplateFromStateAction(template.id));
                      })
                      .catch((err: Error) => notifications.requestError(err))
                      .finally(() => setDeleted(template.id));
                  }}
                  onClick={() => setTemplateToDerive(template.id)}
                  onMoveToCommunity={(e: MenuItemModelClickEvent) => {
                    setMoving(template.id);
                    api
                      .updateTemplate(template.id, { community: true })
                      .then((response: Model.Template) => {
                        e.closeParentDropdown?.();
                        dispatch(actions.removeTemplateFromStateAction(template.id));
                        dispatch(actions.addTemplateToStateAction(response));
                      })
                      .catch((err: Error) => notifications.requestError(err))
                      .finally(() => setMoved(template.id));
                  }}
                  onDuplicate={(e: MenuItemModelClickEvent) => {
                    setDuplicating(template.id);
                    api
                      .duplicateTemplate(template.id)
                      .then((response: Model.Template) => {
                        e.closeParentDropdown?.();
                        dispatch(actions.addTemplateToStateAction(response));
                      })
                      .catch((err: Error) => notifications.requestError(err))
                      .finally(() => setDuplicated(template.id));
                  }}
                />
              );
            })}
            <ShowHide show={templates.length !== 0}>
              <EmptyCard
                className={"template-empty-card"}
                icon={"plus"}
                onClick={() => setCreateTempateModalOpen(true)}
              />
            </ShowHide>
          </div>
        )}
        {templates.length !== 0 && responseWasReceived && (
          <Page.Footer>
            <Pagination
              hideOnSinglePage={true}
              defaultPageSize={100}
              pageSize={pageSize}
              current={page}
              total={count}
              onChange={(pg: number) => {
                dispatch(actions.setTemplatesPaginationAction({ page: pg }));
              }}
            />
          </Page.Footer>
        )}
      </Page>
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
