import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { find, reduce, filter, includes, map, isNil } from "lodash";

import { redux, budgeting, hooks, tabling, util, ui } from "lib";
import { DEFAULT_COLOR_SCHEME, Colors } from "style/constants";

import { BudgetTotalChart } from "components/charts";
import { NoData } from "components/empty";
import { BudgetTotalChartForm, BudgetTotalChartFormValues } from "components/forms";
import { Tile } from "components/layout";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.analysis.groups.data
);
const selectAccounts = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.analysis.accounts.data
);

const selectResponseWasReceived = (state: Application.AuthenticatedStore) => state.budget.analysis.responseWasReceived;

type M = Model.Group | Model.Account;
type Datum = Charts.Datum & { readonly type: "account" | "group" };

const getColor = (obj: M, index: number) =>
  budgeting.typeguards.isGroup(obj)
    ? obj.color || Colors.COLOR_NO_COLOR
    : util.colors.getLoopedColorInScheme(DEFAULT_COLOR_SCHEME, index);
const getLabel = (obj: M) =>
  budgeting.typeguards.isGroup(obj) ? `Group ${obj.name}` : `Account ${obj.description || obj.identifier || ""}`;
const getId = (obj: M) => `${obj.type}-${obj.id}`;

const Metrics: Charts.BudgetTotal.Metric[] = [
  {
    label: "Estimated",
    id: "estimated",
    getValue: (obj: M, objs: Model.Account[]) => budgeting.businessLogic.estimatedValue(obj, objs)
  },
  {
    label: "Actual",
    id: "actual",
    getValue: (obj: M, objs: Model.Account[]) => budgeting.businessLogic.actualValue(obj, objs)
  },
  {
    label: "Variance",
    id: "variance",
    getValue: (obj: M, objs: Model.Account[]) => budgeting.businessLogic.varianceValue(obj, objs)
  }
];

const getMetricValue = (id: Charts.BudgetTotal.MetricId, obj: M, objs: Model.Account[]): number => {
  const metric = find(Metrics, { id }) as Charts.BudgetTotal.Metric;
  return metric.getValue(obj, objs);
};

const getMetricDatum = (id: Charts.BudgetTotal.MetricId, obj: M, objs: Model.Account[], index: number): Datum => {
  return {
    label: getLabel(obj),
    id: getId(obj),
    color: getColor(obj, index),
    value: getMetricValue(id, obj, objs),
    type: obj.type
  };
};

const generateData = (
  metric: Charts.BudgetTotal.MetricId,
  groups: Model.Group[],
  accounts: Model.Account[],
  grouped: boolean
): Datum[] => {
  let accountsWithoutGroup: Model.Account[] = [...accounts];
  let groupDatums: Datum[] = [];
  if (grouped === true) {
    groupDatums = reduce(
      groups,
      (curr: Datum[], g: Model.Group, i: number) => {
        /* Remove the accounts from `accountsWithoutGroup` that are already
					 accounted for via their parent Group. */
        accountsWithoutGroup = filter(accountsWithoutGroup, (a: Model.Account) => !includes(g.children, a.id));
        return [...curr, getMetricDatum(metric, g, accounts, i)];
      },
      []
    );
    if (accountsWithoutGroup.length !== 0) {
      const fakeGroup: Model.Group = {
        color: Colors.COLOR_NO_COLOR,
        name: "Other",
        id: 10000,
        type: "group",
        children: map(accountsWithoutGroup, (a: Model.Account) => a.id)
      };
      groupDatums = [...groupDatums, getMetricDatum(metric, fakeGroup, accounts, groupDatums.length)];
    }
    return groupDatums;
  }
  return map(accountsWithoutGroup, (a: Model.Account, i: number) => getMetricDatum(metric, a, accounts, i));
};

interface BudgetTotalProps extends StandardComponentProps {
  readonly budget: Model.Budget | null;
  readonly budgetId: number;
}

const BudgetTotal = ({ budget, budgetId, ...props }: BudgetTotalProps): JSX.Element => {
  const history = useHistory();
  const [metric, setMetric] = useState<Charts.BudgetTotal.MetricId>("estimated");
  const [grouped, setGrouped] = useState(true);

  const form = ui.hooks.useForm<BudgetTotalChartFormValues>();

  const groups = useSelector(selectGroups);
  const accounts = useSelector(selectAccounts);
  const responseWasReceived = useSelector(selectResponseWasReceived);

  const data = useMemo(
    () => generateData(metric, groups, accounts, grouped),
    [hooks.useDeepEqualMemo(groups), hooks.useDeepEqualMemo(accounts), metric, grouped]
  );

  const budgetTotal = useMemo(() => {
    if (!isNil(budget)) {
      switch (metric) {
        case "actual":
          return tabling.formatters.currencyValueFormatter(v =>
            console.error(`Could not parse currency from value ${v} for budget actual.`)
          )(budgeting.businessLogic.actualValue(budget));
        case "variance":
          return tabling.formatters.currencyValueFormatter(v =>
            console.error(`Could not parse currency from value ${v} for budget variance.`)
          )(budgeting.businessLogic.varianceValue(budget));
        default:
          return tabling.formatters.currencyValueFormatter(v =>
            console.error(`Could not parse currency from value ${v} for budget estimated.`)
          )(budgeting.businessLogic.estimatedValue(budget));
      }
    }
    return tabling.formatters.currencyValueFormatter(0);
  }, [budget, metric]);

  return (
    <Tile
      {...props}
      title={"Budget Total"}
      subTitle={budgetTotal}
      contentProps={{ style: { height: 250 } }}
      style={props.style}
    >
      {accounts.length !== 0 && responseWasReceived ? (
        <>
          <BudgetTotalChartForm
            initialValues={{ grouped: true, metric: "estimated" }}
            form={form}
            style={{ position: "absolute", top: 10, right: 10, maxWidth: 150 }}
            metrics={Metrics}
            onValuesChange={(changedValues: Partial<BudgetTotalChartFormValues>) => {
              if (changedValues.grouped !== undefined) {
                setGrouped(changedValues.grouped);
              }
              if (changedValues.metric !== undefined) {
                setMetric(changedValues.metric);
              }
            }}
          />
          <BudgetTotalChart<Datum> data={data} />
        </>
      ) : (
        <NoData
          subTitle={"Your budget does not have any data. Add data to see analysis."}
          button={{
            onClick: () => history.push(`/budgets/${budgetId}/accounts`),
            text: "Go to Budget"
          }}
        />
      )}
    </Tile>
  );
};

export default BudgetTotal;
