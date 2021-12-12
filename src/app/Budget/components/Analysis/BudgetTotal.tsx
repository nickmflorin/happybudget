import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { find, reduce, filter, includes, map, isNil } from "lodash";

import { redux, budgeting, hooks, tabling, util, ui } from "lib";
import { DEFAULT_TAG_COLOR_SCHEME, Colors } from "style/constants";

import { BudgetTotalChart } from "components/charts";
import { BudgetTotalChartForm, BudgetTotalChartFormValues } from "components/forms";
import { Tile } from "components/layout";

const selectGroups = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.analysis.groups.data
);
const selectAccounts = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.analysis.accounts.data
);

type M = Model.Group | Model.Account;

const getColor = (obj: M, index: number) =>
  budgeting.typeguards.isGroup(obj)
    ? obj.color || Colors.COLOR_NO_COLOR
    : util.colors.getLoopedColorInScheme(DEFAULT_TAG_COLOR_SCHEME, index);
const getLabel = (obj: M) => (budgeting.typeguards.isGroup(obj) ? obj.name : obj.identifier || obj.description || "");
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

const getMetricDatum = (
  id: Charts.BudgetTotal.MetricId,
  obj: M,
  objs: Model.Account[],
  index: number
): Charts.Pie.Datum => {
  const metric = find(Metrics, { id } as any) as Charts.BudgetTotal.Metric;
  return {
    label: getLabel(obj),
    id: getId(obj),
    color: getColor(obj, index),
    value: metric.getValue(obj, objs)
  };
};

const generateData = (
  metric: Charts.BudgetTotal.MetricId,
  groups: Model.Group[],
  accounts: Model.Account[],
  grouped: boolean
): Charts.Pie.Datum[] => {
  let accountsWithoutGroup: Model.Account[] = [...accounts];
  let groupDatums: Charts.Pie.Datum[] = [];
  if (grouped === true) {
    groupDatums = reduce(
      groups,
      (curr: Charts.Pie.Datum[], g: Model.Group, i: number) => {
        /* Remove the accounts from `accountsWithoutGroup` that are already
					 accounted for via their parent Group. */
        accountsWithoutGroup = filter(accountsWithoutGroup, (a: Model.Account) => !includes(g.children, a.id));
        return [...curr, getMetricDatum(metric, g, accounts, i)];
      },
      []
    );
  }
  return [
    ...groupDatums,
    ...map(accountsWithoutGroup, (a: Model.Account, i: number) => getMetricDatum(metric, a, accounts, i))
  ];
};

interface BudgetTotalProps {
  readonly budget: Model.Budget | null;
}

const BudgetTotal = (props: BudgetTotalProps): JSX.Element => {
  const [metric, setMetric] = useState<Charts.BudgetTotal.MetricId>("estimated");
  const [grouped, setGrouped] = useState(true);

  const form = ui.hooks.useForm<BudgetTotalChartFormValues>();

  const groups = useSelector(selectGroups);
  const accounts = useSelector(selectAccounts);

  const data = useMemo(
    () => generateData(metric, groups, accounts, grouped),
    [hooks.useDeepEqualMemo(groups), hooks.useDeepEqualMemo(accounts), metric, grouped]
  );

  return (
    <Tile
      title={"Budget Total"}
      subTitle={
        !isNil(props.budget)
          ? tabling.formatters.currencyValueFormatter(budgeting.businessLogic.estimatedValue(props.budget))
          : "0.00"
      }
      contentProps={{ style: { height: 250 } }}
      style={{
        maxWidth: 700
      }}
    >
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
      <BudgetTotalChart data={data} />
    </Tile>
  );
};

export default BudgetTotal;
