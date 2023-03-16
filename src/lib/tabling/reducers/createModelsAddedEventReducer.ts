import { isNil, reduce, filter, includes, intersection } from "lodash";

import { tabling, util } from "lib";

import { reorderRows, updateRowGroup } from "./util";

/**
 * Reducer that updates the Redux.TableStore<R> store by converting models to
 * rows after they are created and inserting the rows into the table data in the
 * store.
 *
 * @returns The updated table store, Redux.TableStore<R>, with the models
 *          converted to rows and inserted into the store.
 */
const createModelsAddedEventReducer = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Redux.ActionContext = Redux.ActionContext,
>(
  config: Table.AuthenticatedReducerConfig<R, M, S, C>,
): Redux.BasicReducer<S, Table.ModelsAddedEvent<M>> => {
  const groupRowManager = new tabling.rows.GroupRowManager<R, M>({ columns: config.columns });
  const markupRowManager = new tabling.rows.MarkupRowManager({ columns: config.columns });
  const modelRowManager = new tabling.rows.ModelRowManager<R, M>({
    getRowChildren: config.getModelRowChildren,
    columns: config.columns,
  });
  /**
	* Updates the table store by inserting a Group that was previously not in the
	* table into the table, using the Model.Group object to construct the
	* Table.GroupRow object that is inserted into the store.
	*
	* When a Group is added to the table, we must first convert the Model.Group
	* model to a Table.GroupRow.  Then, we need to insert the Table.GroupRow into
	* the set of table data and reapply the ordering scheme on the overall set of
	* table data so the Table.GroupRow appears in the correct location.
	*
	* When a Model.Group is created, it may be created with children that already
	* belong to another Model.Group.  In this case, the backend will automatically
	* remove those children from the previous Model.Group they belonged to - but
	* we also need to apply that change in the reducer here.

	* @returns The updated table store, Redux.TableStore<R>, with the
	*          Table.GroupRow inserted.
	*/
  const addGroupToState = (group: Model.Group, s: S, reorder = true) => {
    const newGroupRow: Table.GroupRow<R> = groupRowManager.create({ model: group });
    const groupsWithChild: Table.GroupRow<R>[] = filter(
      s.data,
      (r: Table.Row<R>) =>
        tabling.rows.isGroupRow(r) && intersection(r.children, newGroupRow.children).length !== 0,
    ) as Table.GroupRow<R>[];
    const newState = reduce(
      groupsWithChild,
      (st: S, groupRow: Table.GroupRow<R>) => ({
        ...st,
        data: util.replaceInArray<Table.BodyRow<R>>(
          st.data,
          { id: groupRow.id },
          {
            ...groupRow,
            children: filter(
              groupRow.children,
              (id: number) => !includes(newGroupRow.children, id),
            ),
          },
        ),
      }),
      s,
    );
    return reorder
      ? reorderRows({
          ...newState,
          data: [...newState.data, newGroupRow],
        })
      : { ...newState, data: [...newState.data, newGroupRow] };
  };

  /**
   * Updates the table store by inserting a Markup that was previously not in
   * the table into the table, using the Model.Markup object to construct the
   * Table.MarkupRow object that is inserted into the store.
   *
   * @returns The updated table store, Redux.TableStore<R>, with the
   *          Table.MarkupRow inserted.
   */
  const addMarkupToState = (markup: Model.Markup, s: S, reorder = true) => {
    const markupRow = markupRowManager.create({ model: markup });
    return reorder
      ? reorderRows({
          ...s,
          data: [...s.data, markupRow],
        })
      : { ...s, data: [...s.data, markupRow] };
  };

  /**
   * Updates the table store by inserting a model that was previously not in
   * the table into the table, using the model object to construct the
   * Table.ModelRow object that is inserted into the store.
   *
   * The group will only be defined and non-null if the newly created model
   * belongs to a Model.Group.  If the newly created model does not belong to a
   * Model.Group, the group will not be included.
   *
   * Unlike the case where we handle updates to the model, we do not need to
   * be concerned with null values for the group since null values here are not
   * used to communicate that the group was removed - as the group cannot
   * "change" for a newly created model.
   *
   * @returns The updated table store, Redux.TableStore<R>, with the
   *          Table.ModelRow inserted.
   */
  const addModelToState = (model: M, group: number | null | undefined, s: S, reorder = true) => {
    const modelRow: Table.ModelRow<R> = modelRowManager.create({ model });
    s = { ...s, data: [...s.data, modelRow] };
    if (!isNil(group)) {
      s = updateRowGroup(s, [modelRow.id], tabling.rows.groupRowId(group));
    }
    return reorder ? reorderRows(s) : s;
  };

  const isMarkup = (
    p: Table.ModelTableEventPayload<M> | Model.Group | Model.Markup,
  ): p is Model.Markup => (p as Model.Markup).type === "markup";

  const isGroup = (
    p: Table.ModelTableEventPayload<M> | Model.Group | Model.Markup,
  ): p is Model.Group => (p as Model.Group).type === "group";

  return (state: S = config.initialState, e: Table.ModelsAddedEvent<M>): S => {
    const payloads: (Table.ModelTableEventPayload<M> | Model.Group | Model.Markup)[] =
      Array.isArray(e.payload) ? e.payload : [e.payload];
    return reorderRows(
      reduce(
        payloads,
        (s: S, p: Table.ModelTableEventPayload<M> | Model.Group | Model.Markup) => {
          if (isMarkup(p)) {
            return addMarkupToState(p, s, false);
          } else if (isGroup(p)) {
            return addGroupToState(p, s, false);
          } else {
            return addModelToState(p.model, p.group, s, false);
          }
        },
        state,
      ),
    );
  };
};

export default createModelsAddedEventReducer;
