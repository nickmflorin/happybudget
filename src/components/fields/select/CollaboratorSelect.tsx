import React from "react";
import { map } from "lodash";
import { components, OptionProps } from "react-select";
import classNames from "classnames";

import * as api from "api";
import { hooks } from "store";
import { http, ui } from "lib";

import { UserImageOrInitials } from "components/images";

import { AsyncOption } from "./AsyncSelect";
import MultiModelAsyncSelect, { MultiModelAsyncSelectProps } from "./MultiModelAsyncSelect";

export type CollaboratorSelectProps = Omit<
  MultiModelAsyncSelectProps<Model.SimpleUser>,
  "loadOptions" | "getOptionLabel" | "noOptionsMessage" | "components"
> & {
  readonly currentCollaborators: Model.Collaborator[];
};

const Option = <G extends AsyncSelectGroupBase<Model.WithStringId<Model.SimpleUser>>>(
  props: OptionProps<AsyncSelectOption<Model.WithStringId<Model.SimpleUser>>, true, G>
) =>
  ui.select.isSelectErrorOption(props.data) ? (
    <AsyncOption {...props} />
  ) : (
    <components.Option {...props} className={classNames("collaborator-select-option", props.className)}>
      <div className={"user-image-or-initials-container"}>
        <UserImageOrInitials circle={true} user={{ ...props.data, id: parseInt(props.data.id) }} />
      </div>
      <div className={"name-container"}>{props.data.full_name}</div>
    </components.Option>
  );

const MemoizedOption = React.memo(Option) as typeof Option;

const CollaboratorSelect = ({ currentCollaborators, ...props }: CollaboratorSelectProps): JSX.Element => {
  const user = hooks.useLoggedInUser();
  const [cancelToken] = http.useCancelToken();

  return (
    <MultiModelAsyncSelect
      placeholder={"Search users..."}
      {...props}
      components={{ Option: MemoizedOption }}
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
