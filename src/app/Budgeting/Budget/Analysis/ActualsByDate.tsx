import { useMemo } from "react";

import { reduce, filter, groupBy, map, isNil } from "lodash";
import moment, { Moment } from "moment";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { redux, hooks } from "lib";
import { NoData } from "components";
import { ActualsByDateChart } from "components/charts";
import { Tile } from "components/containers";
import { Colors } from "style/constants";

const selectActuals = redux.simpleDeepEqualSelector(
  (state: Application.Store) => state.budget.analysis.actuals.data,
);

const selectResponseWasReceived = (state: Application.Store) =>
  state.budget.analysis.responseWasReceived;

type ActualWithDate = Omit<Model.Actual, "date"> & { readonly date: string };
type ActualWithMoment = Omit<ActualWithDate, "date"> & { readonly date: Moment };

const getMonthString = (a: ActualWithMoment) =>
  a.date.subtract(1, "month").startOf("month").format("MMMM");

const generateData = (actuals: Model.Actual[]): Charts.Datum[] => {
  const actualsByMonth: { [key: string]: ActualWithMoment[] } = groupBy(
    filter(
      map(
        filter(actuals, (a: Model.Actual) => !isNil(a.date)) as ActualWithDate[],
        (a: ActualWithDate) => ({
          ...a,
          date: moment(a.date),
        }),
      ) as ActualWithMoment[],
      (a: ActualWithMoment) => a.date.isValid(),
    ),
    getMonthString,
  );
  return map(Object.keys(actualsByMonth), (key: string) => ({
    color: Colors.GREEN,
    label: key,
    id: key,
    value: reduce(
      actualsByMonth[key],
      (curr: number, a: ActualWithMoment) => {
        if (!isNil(a.value)) {
          return curr + a.value;
        }
        return curr;
      },
      0.0,
    ),
  }));
};

interface ActualsByDateProps extends StandardComponentProps {
  readonly budgetId: number;
}

const ActualsByDate = ({ budgetId, ...props }: ActualsByDateProps): JSX.Element => {
  const history = useHistory();
  const actuals = useSelector(selectActuals);
  const responseWasReceived = useSelector(selectResponseWasReceived);

  const data = useMemo(() => generateData(actuals), [hooks.useDeepEqualMemo(actuals)]);

  return (
    <Tile
      title="Actuals by Month"
      {...props}
      contentProps={{ style: { height: 250 } }}
      style={props.style}
    >
      {actuals.length !== 0 && responseWasReceived ? (
        <ActualsByDateChart data={data} />
      ) : (
        <NoData
          subTitle="Your budget does not have any actuals data. Add data to see analysis."
          button={{
            onClick: () => history.push(`/budgets/${budgetId}/actuals`),
            text: "Go to Actuals",
          }}
        />
      )}
    </Tile>
  );
};

export default ActualsByDate;
