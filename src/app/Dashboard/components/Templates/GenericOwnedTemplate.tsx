import React from "react";

import { Icon } from "components";
import { PrimaryButtonIconToggle } from "components/buttons";
import { BudgetEmptyIcon } from "components/svgs";

import GenericOwned, { GenericOwnedProps, RenderGenericOwnedCardParams } from "../GenericOwned";

export type RenderGenericOwnedTemplateCardParams =
  RenderGenericOwnedCardParams<Model.SimpleTemplate>;

export type GenericOwnedTemplateProps = Omit<
  GenericOwnedProps<Model.SimpleTemplate>,
  "confirmDeleteProps" | "searchPlaceholder"
> & {
  readonly onCreate: () => void;
};

const GenericOwnedTemplate = (props: GenericOwnedTemplateProps): JSX.Element => (
  <GenericOwned
    {...props}
    searchPlaceholder="Search Templates..."
    noDataProps={{ ...props.noDataProps, child: <BudgetEmptyIcon /> }}
    confirmDeleteProps={{
      suppressionKey: "delete-template-confirmation-suppressed",
      title: "Delete Template",
    }}
    createMenuElement={
      <PrimaryButtonIconToggle
        key={2}
        icon={<Icon icon="plus" weight="regular" />}
        onClick={() => props.onCreate()}
        text="New Blank Budget"
        breakpoint="medium"
      />
    }
  />
);

export default React.memo(GenericOwnedTemplate);
