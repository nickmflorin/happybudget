import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { map, isNil } from "lodash";

import { Pagination } from "antd";

import * as api from "api";
import { redux, notifications, users } from "lib";

import { ShowHide, Icon } from "components";
import { PrimaryButtonIconToggle, OrderingButtonIconToggle } from "components/buttons";
import { CommunityTemplateCard, EmptyCard } from "components/cards";
import { OrderingDropdown } from "components/dropdowns";
import { SearchInput } from "components/fields";
import { Page } from "components/layout";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { IsStaff } from "components/permissions";

import { actions } from "../../store";

const selectTemplates = (state: Application.AuthenticatedStore) => state.dashboard.community.data;
const selectResponseReceived = (state: Application.AuthenticatedStore) => state.dashboard.community.responseWasReceived;
const selectLoading = (state: Application.AuthenticatedStore) => state.dashboard.community.loading;
const selectPage = (state: Application.AuthenticatedStore) => state.dashboard.community.page;
const selectPageSize = (state: Application.AuthenticatedStore) => state.dashboard.community.pageSize;
const selectCount = (state: Application.AuthenticatedStore) => state.dashboard.community.count;
const selectSearch = (state: Application.AuthenticatedStore) => state.dashboard.community.search;
const selectOrdering = (state: Application.AuthenticatedStore) => state.dashboard.community.ordering;

interface DiscoverProps {
  readonly setTemplateToDerive: (template: number) => void;
  readonly setCreateBudgetModalOpen: (v: boolean) => void;
}

const Discover: React.FC<DiscoverProps> = ({ setCreateBudgetModalOpen, setTemplateToDerive }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<number | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);
  const user = users.hooks.useLoggedInUser();
  const [isDeleting, setDeleting, setDeleted] = redux.hooks.useTrackModelActions([]);
  const [isTogglingVisibility, setTogglingVisibility, setVisibilityToggled] = redux.hooks.useTrackModelActions([]);
  const [isDuplicating, setDuplicating, setDuplicated] = redux.hooks.useTrackModelActions([]);

  const dispatch: Redux.Dispatch = useDispatch();
  const templates = useSelector(selectTemplates);
  const loading = useSelector(selectLoading);
  const responseWasReceived = useSelector(selectResponseReceived);
  const page = useSelector(selectPage);
  const pageSize = useSelector(selectPageSize);
  const count = useSelector(selectCount);
  const search = useSelector(selectSearch);
  const ordering = useSelector(selectOrdering);

  const history = useHistory();

  useEffect(() => {
    dispatch(actions.requestCommunityTemplatesAction(null));
  }, []);

  return (
    <React.Fragment>
      <Page
        className={"discover"}
        pageProps={{ className: "dashboard-page" }}
        title={"Discover"}
        loading={loading}
        subMenu={[
          <SearchInput
            key={1}
            placeholder={"Search Templates..."}
            value={search}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(actions.setCommunityTemplatesSearchAction(event.target.value, {}))
            }
          />,
          <PrimaryButtonIconToggle
            key={2}
            icon={<Icon icon={"plus"} weight={"light"} />}
            onClick={() => setCreateBudgetModalOpen(true)}
            text={"New Blank Budget"}
            breakpoint={"medium"}
          />,
          <OrderingDropdown
            key={3}
            ordering={ordering}
            onChange={(field: string, order: Http.Order) =>
              dispatch(actions.updateCommunityTemplatesOrderingAction({ field, order }))
            }
            models={[
              { id: "created_at", icon: "bars-sort", label: "Created" },
              { id: "updated_at", icon: "timer", label: "Last Updated" },
              { id: "name", icon: "sort-alpha-down", label: "Name" }
            ]}
          >
            <OrderingButtonIconToggle
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
        <div className={"dashboard-card-grid"}>
          {map(templates, (template: Model.Template, index: number) => {
            /* The API will exclude hidden community templates for non-staff
							 users by design.  However, just in case we will also make sure
							 that we are not showing those templates to the user in the
							 frontend. */
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
                onToggleVisibility={(e: MenuItemModelClickEvent) => {
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
                onDelete={(e: MenuItemModelClickEvent) => {
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
                onDuplicate={(e: MenuItemModelClickEvent) => {
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
            <ShowHide show={responseWasReceived}>
              <EmptyCard
                title={"New Community Template"}
                icon={"plus"}
                onClick={() => setCreateTempateModalOpen(true)}
              />
            </ShowHide>
          </IsStaff>
        </div>
        <Page.Footer>
          <Pagination
            hideOnSinglePage={false}
            showSizeChanger={true}
            defaultPageSize={10}
            current={page}
            pageSize={pageSize}
            total={count}
            onChange={(pg: number, pgSize: number | undefined) =>
              dispatch(
                actions.setCommunityTemplatesPaginationAction(
                  pageSize === undefined ? { page: pg } : { page: pg, pageSize: pgSize }
                )
              )
            }
          />
        </Page.Footer>
      </Page>
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
    </React.Fragment>
  );
};

export default Discover;
