import React from "react";

import { model } from "lib";
import SingleChoiceSelect, { SingleChoiceSelectProps } from "./SingleChoiceSelect";

export type MarkupUnitSelectProps = Omit<SingleChoiceSelectProps<Model.MarkupUnit>, "options">;

const MarkupUnitSelect = (props: MarkupUnitSelectProps): JSX.Element => (
  <SingleChoiceSelect {...props} options={model.budgeting.MarkupUnits.choices} />
);

export default React.memo(MarkupUnitSelect);
