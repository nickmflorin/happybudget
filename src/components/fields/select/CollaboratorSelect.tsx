import React from "react";
import { map } from "lodash";
import classNames from "classnames";

import * as api from "api";
import { hooks } from "store";
import { http } from "lib";

import { UserImageOrInitials } from "components/images";

import { options, MultiModelAsyncSelect, MultiModelAsyncSelectProps } from "./generic";

export type CollaboratorSelectProps = Omit<
  MultiModelAsyncSelectProps<Model.SimpleUser>,
  "loadOptions" | "getOptionLabel" | "noOptionsMessage" | "components"
> & {
  readonly currentCollaborators: Model.Collaborator[];
};

const Option = <G extends SelectGroupBase<ModelSelectOption<Model.SimpleUser>>>(
  props: options.ModelSelectOptionProps<ModelSelectOption<Model.SimpleUser>, true, G>
) => (
  <options.ModelSelectOption {...props} className={classNames("collaborator-select-option", props.className)}>
    <div style={{ display: "flex" }}>
      <div className={"user-image-or-initials-container"}>
        <UserImageOrInitials circle={true} user={{ ...props.data, id: parseInt(props.data.id) }} />
      </div>
      <div className={"name-container"}>{props.data.full_name}</div>
    </div>
  </options.ModelSelectOption>
);

const MemoizedOption = React.memo(Option) as typeof Option;

const CollaboratorSelect = ({ currentCollaborators, ...props }: CollaboratorSelectProps): JSX.Element => {
  const user = hooks.useLoggedInUser();
  const [cancelToken] = http.useCancelToken();

  return (
    <MultiModelAsyncSelect<Model.SimpleUser>
      placeholder={"Search users..."}
      {...props}
      components={{ Option: MemoizedOption }}
      noOptionsMessage={() => "No users found."}
      loadOptionsWithoutValue={false}
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
