import { useState } from "react";

import { isNil, includes } from "lodash";
import { useSelector, useDispatch } from "react-redux";

import * as api from "api";
import { redux, hooks, tabling } from "lib";

import * as selectors from "./store/selectors";

type M = Model.SubAccount;
type R = Tables.SubAccountRowData;

type PublicUseFringesModalControlProps<
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
> = SubAccountsTableContext<B, P, true> & {
  readonly table: Table.TableInstance<R, M>;
};

type AuthenticatedUseFringesModalControlProps<
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
> = SubAccountsTableContext<B, P, false> & {
  readonly table: Table.TableInstance<R, M>;
  readonly tableEventAction: Redux.ActionCreator<
    Table.Event<Tables.SubAccountRowData, Model.SubAccount>,
    SubAccountsTableActionContext<B, P, false>
  >;
  readonly fringesTableEventAction: Redux.ActionCreator<
    Table.Event<Tables.FringeRowData, Model.Fringe>,
    FringesTableActionContext<B, P, false>
  >;
};

type UseFringesModalControlProps<
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
> = AuthenticatedUseFringesModalControlProps<B, P> | PublicUseFringesModalControlProps<B, P>;

/**
 * The FringesModal is opened one of two ways:
 *
 * (1) Via the Fringes Column Header via an edit button.
 * (2) Via the Fringes Column Editor, via the "Add Fringes" button in the
 *     dropdown.
 *
 * In case (1), the action is not tied to a specific row and we do not need
 * to be worried about preemptively creating a Fringe.
 *
 * In case (2), the modal is being opened while editing a specific row, and it
 * is possible that the User had entered a value for the Fringe `name` in the
 * search field.  In this case, if there is a `name` entered in the search
 * field, we want to preemptively create the Fringe with that `name`, add it
 * to the table and associate it with the SubAccount corresponding to the row
 * being edited.
 */
export const useFringesModalControl = <
  B extends Model.Budget | Model.Template,
  P extends Model.Account | Model.SubAccount,
>(
  props: UseFringesModalControlProps<B, P>,
): [
  boolean,
  (params?: { readonly rowId: Table.ModelRowId; readonly name?: string }) => void,
  () => void,
] => {
  const dispatch = useDispatch();
  const [fringesModalVisible, setFringesModalVisible] = useState(false);

  const data = useSelector(
    (s: Application.Store) =>
      selectors.selectSubAccountsTableStore(s, {
        parentId: props.parentId,
        domain: props.domain,
        parentType: props.parentType,
        // The store will only be accessed if `public` is `false`.
        public: props.public,
      }).data,
  );

  const onViewFringes = hooks.useDynamicCallback(
    (params?: { readonly rowId: Table.ModelRowId; readonly name?: string }) => {
      /*
			The params should not be included for the public case, but we need to
			include the conditional to typing purposes as the event action creators
			will not be defined for the public case.
			*/
      let fringesModalOpened = false;
      if (!isNil(params) && !isNil(params.name) && props.public !== true) {
        const subaccountRow = redux.findModelInData(data, params.rowId, {
          modelName: "SubAccountRow",
        });
        if (!isNil(subaccountRow) && tabling.rows.isModelRow(subaccountRow)) {
          api
            .createFringe(props.budgetId, { subaccounts: [params.rowId], name: params.name })
            .then((fringe: Model.Fringe) => {
              if (includes(subaccountRow.data.fringes, fringe.id)) {
                // This should never happen - but just in case we need to log.
                console.error(
                  `Model row ${subaccountRow.id} is already associated with Fringe ${fringe.id} that was just created!`,
                );
              } else {
                /*
								Once the Fringe is created, we have to add it to the TableStore.
								*/
                dispatch(
                  props.fringesTableEventAction(
                    { type: "modelsAdded", payload: { model: fringe } },
                    props,
                  ),
                );
                /*
								Once the Fringe is added to the TableStore, we have to associate
								it with the SubAccount for the row that was being edited.
								*/
                dispatch(
                  props.tableEventAction(
                    {
                      type: "updateRows",
                      payload: {
                        id: subaccountRow.id,
                        data: { fringes: [...subaccountRow.data.fringes, fringe.id] },
                      },
                    },
                    props,
                  ),
                );
              }
              setFringesModalVisible(true);
              fringesModalOpened = true;
            })
            .catch((e: Error) => {
              /*
							We might want to consider not vocalizing this to the User, since
							it is unlikely they would notice since this feature is an add
							on and the expected behavior of the FringesModal opening will
							still occur.
							*/
              props.table.handleRequestError(e, {
                message: "There was an error adding the fringe to the table.",
              });
            });
        } else if (!isNil(subaccountRow) && !tabling.rows.isModelRow(subaccountRow)) {
          // This should never happen, but just in case we want to be aware of it.
          console.error(
            `Row type ${subaccountRow.rowType} encountered when editing Fringe(s) but a model row was expected!`,
          );
        }
      }
      if (!fringesModalOpened) {
        /*
				Even though there was an error, proceed as if the FringesModal is
				being opened without preemptively adding a Fringe. */
        setFringesModalVisible(true);
      }
    },
  );
  return [fringesModalVisible, onViewFringes, () => setFringesModalVisible(false)];
};
