import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { map, isNil } from "lodash";

import * as api from "api";
import { redux, notifications } from "lib";
import * as store from "store";

import { ShowHide, Icon, Pagination } from "components";
import { PrimaryButtonIconToggle, OrderingButtonIconToggle } from "components/buttons";
import { CommunityTemplateCard, CommunityTemplateStaffCard, EmptyCard } from "components/containers";
import { OrderingDropdownMenu } from "components/dropdowns";
import { SearchInput } from "components/fields";
import { Page } from "components/layout";
import { EditTemplateModal, CreateTemplateModal } from "components/modals";
import { IsStaff } from "components/permissions";

import { actions } from "../../store";

const selectTemplates = (state: Application.Store) => state.dashboard.community.data;
const selectResponseReceived = (state: Application.Store) => state.dashboard.community.responseWasReceived;
const selectLoading = (state: Application.Store) => state.dashboard.community.loading;
const selectPage = (state: Application.Store) => state.dashboard.community.page;
const selectPageSize = (state: Application.Store) => state.dashboard.community.pageSize;
const selectCount = (state: Application.Store) => state.dashboard.community.count;
const selectSearch = (state: Application.Store) => state.dashboard.community.search;
const selectOrdering = (state: Application.Store) => state.dashboard.community.ordering;

interface DiscoverProps {
  readonly setTemplateToDerive: (template: number) => void;
  readonly setCreateBudgetModalOpen: (v: boolean) => void;
}

const Discover: React.FC<DiscoverProps> = ({ setCreateBudgetModalOpen, setTemplateToDerive }): JSX.Element => {
  const [templateToEdit, setTemplateToEdit] = useState<number | undefined>(undefined);
  const [createTemplateModalOpen, setCreateTempateModalOpen] = useState(false);
  const user = store.hooks.useLoggedInUser();
  const [isDeleting, setDeleting, setDeleted] = redux.useTrackModelActions([]);
  const [isTogglingVisibility, setTogglingVisibility, setVisibilityToggled] = redux.useTrackModelActions([]);
  const [isDuplicating, setDuplicating, setDuplicated] = redux.useTrackModelActions([]);

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
            icon={<Icon icon={"plus"} weight={"regular"} />}
            onClick={() => setCreateBudgetModalOpen(true)}
            text={"New Blank Budget"}
            breakpoint={"medium"}
          />,
          <OrderingDropdownMenu
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
              breakpoint={"medium"}
              ordering={ordering}
              labelMap={{
                created_at: "Created",
                updated_at: "Last Updated",
                name: "Name"
              }}
            />
          </OrderingDropdownMenu>
        ]}
        contentScrollable={true}
      >
        <div className={"dashboard-card-grid"}>
          {map(templates, (template: Model.SimpleTemplate, index: number) => {
            /* The API will exclude hidden community templates for non-staff
							 users by design.  However, just in case we will also make sure
							 that we are not showing those templates to the user in the
							 frontend. */
            if (template.hidden === true && user.is_staff === false) {
              console.error(
                "The API is returning hidden community templates for non-staff users!  This is a security problem!"
              );
            }
            let card: JSX.Element = (
              <CommunityTemplateStaffCard
                budget={template}
                hidingOrShowing={isTogglingVisibility(template.id)}
                duplicating={isDuplicating(template.id)}
                deleting={isDeleting(template.id)}
                disabled={isDeleting(template.id) || isDuplicating(template.id)}
                loading={isDeleting(template.id)}
                onToggleVisibility={(e: MenuItemModelClickEvent) => {
                  if (user.is_staff === false) {
                    throw new Error("Behavior prohibited for non-staff users.");
                  }
                  if (template.hidden === true) {
                    setTogglingVisibility(template.id);
                    api
                      .updateBudget<Model.Template>(template.id, { hidden: false })
                      .then((response: Model.Template) => {
                        dispatch(actions.updateCommunityTemplateInStateAction({ id: template.id, data: response }));
                        e.closeParentDropdown?.();
                      })
                      .catch((err: Error) => notifications.requestError(err))
                      .finally(() => setVisibilityToggled(template.id));
                  } else {
                    setTogglingVisibility(template.id);
                    api
                      .updateBudget<Model.Template>(template.id, { hidden: true })
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
                    .deleteBudget(template.id)
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
                    /* We have to use a large timeout because this is a request
                       that sometimes takes a very long time. */
                    .duplicateBudget<Model.Template>(template.id, { timeout: 120 * 1000 })
                    .then((response: Model.Template) => {
                      e.closeParentDropdown?.();
                      dispatch(actions.addCommunityTemplateToStateAction(response));
                    })
                    .catch((err: Error) => notifications.requestError(err))
                    .finally(() => setDuplicated(template.id));
                }}
              />
            );
            if (user.is_staff !== true) {
              card = <CommunityTemplateCard budget={template} onClick={() => setTemplateToDerive(template.id)} />;
            }
            if (template.hidden === true) {
              return <IsStaff key={index}>{card}</IsStaff>;
            }
            return <React.Fragment key={index}>{card}</React.Fragment>;
          })}
          <IsStaff>
            <ShowHide show={responseWasReceived}>
              <EmptyCard icon={"plus"} onClick={() => setCreateTempateModalOpen(true)} />
            </ShowHide>
          </IsStaff>
        </div>
        <Page.Footer>
          <Pagination
            hideOnSinglePage={true}
            defaultPageSize={100}
            pageSize={pageSize}
            current={page}
            total={count}
            onChange={(pg: number) => {
              dispatch(actions.setCommunityTemplatesPaginationAction({ page: pg }));
            }}
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
