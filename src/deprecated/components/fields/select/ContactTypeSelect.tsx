import React from "react";

import { model } from "lib";

import { SingleChoiceSelect, SingleChoiceSelectProps } from "./generic";

export type ContactTypeSelectProps = Omit<SingleChoiceSelectProps<Model.ContactType>, "options">;

const ContactTypeSelect = (props: ContactTypeSelectProps): JSX.Element => (
  <SingleChoiceSelect {...props} options={model.contact.ContactTypes.choices} />
);

export default React.memo(ContactTypeSelect);
