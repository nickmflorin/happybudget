import React from "react";

import { model } from "lib";
import SingleHttpModelSelect, { SingleHttpModelSelectProps } from "./SingleHttpModelSelect";

export type CollaboratorAccessTypeSelectProps = Omit<
  SingleHttpModelSelectProps<Model.CollaboratorAccessType>,
  "options" | "getOptionLabel"
>;

const CollaboratorAccessTypeSelect = (props: CollaboratorAccessTypeSelectProps): JSX.Element => (
  <SingleHttpModelSelect
    borderless={true}
    {...props}
    options={model.budgeting.CollaboratorAccessTypes.choices}
    getOptionLabel={(option: Model.CollaboratorAccessType) => option.name}
    isClearable={false}
    isSearchable={false}
  />
);

export default React.memo(CollaboratorAccessTypeSelect);
