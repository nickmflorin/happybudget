import React from "react";

import { model } from "lib";
import SingleChoiceSelect, { SingleChoiceSelectProps } from "./SingleChoiceSelect";

export type CollaboratorAccessTypeSelectProps = Omit<
  SingleChoiceSelectProps<Model.CollaboratorAccessType>,
  "options" | "getOptionLabel"
>;

const CollaboratorAccessTypeSelect = (props: CollaboratorAccessTypeSelectProps): JSX.Element => (
  <SingleChoiceSelect borderless={true} {...props} options={model.budgeting.CollaboratorAccessTypes.choices} />
);

export default React.memo(CollaboratorAccessTypeSelect);
