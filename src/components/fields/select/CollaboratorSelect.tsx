import React from "react";
import { map } from "lodash";
import { components, OptionProps } from "react-select";
import classNames from "classnames";

import * as api from "api";
import { hooks } from "store";
import { http } from "lib";

import { UserImageOrInitials } from "components/images";

import MultiHttpModelAsyncSelect, { MultiHttpModelAsyncSelectProps } from "./MultiHttpModelAsyncSelect";

export type CollaboratorSelectProps = Omit<
  MultiHttpModelAsyncSelectProps<Model.SimpleUser>,
  "loadOptions" | "getOptionLabel" | "noOptionsMessage" | "components"
> & {
  readonly currentCollaborators: Model.Collaborator[];
  readonly className?: string;
  readonly onChange?: (ms: Model.SimpleUser[]) => void;
};

const Option = React.memo((props: OptionProps<Model.WithStringId<Model.SimpleUser>, true>) => (
  <components.Option {...props} className={classNames("collaborator-select-option", props.className)}>
    <div className={"user-image-or-initials-container"}>
      <UserImageOrInitials circle={true} user={{ ...props.data, id: parseInt(props.data.id) }} />
    </div>
    <div className={"name-container"}>{props.data.full_name}</div>
  </components.Option>
));

const CollaboratorSelect = ({ currentCollaborators, ...props }: CollaboratorSelectProps): JSX.Element => {
  const user = hooks.useLoggedInUser();
  const [cancelToken] = http.useCancelToken();

  return (
    <MultiHttpModelAsyncSelect
      placeholder={"Search users..."}
      {...props}
      components={{ Option }}
      noOptionsMessage={() => "No users found."}
      loadOptions={(inputValue: string) =>
        api.searchUsers(
          inputValue,
          { exclude: [...map(currentCollaborators, (c: Model.Collaborator) => c.user.id), user.id] },
          { cancelToken: cancelToken() }
        )
      }
      getOptionLabel={(m: Model.SimpleUser) => m.full_name}
    />
  );
};

export default React.memo(CollaboratorSelect);
