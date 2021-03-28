export const userToSimpleUser = (user: IUser): ISimpleUser => {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: user.full_name,
    email: user.email,
    profile_image: user.profile_image
  };
};

export const subAccountGroupToSubAccountNestedGroup = (group: IGroup<ISimpleSubAccount>): INestedGroup => {
  return {
    id: group.id,
    color: group.color,
    name: group.name,
    estimated: group.estimated,
    variance: group.variance,
    actual: group.actual,
    created_by: group.created_by,
    updated_by: group.updated_by,
    created_at: group.created_at,
    updated_at: group.updated_at
  };
};
