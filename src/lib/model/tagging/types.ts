import * as ui from "../../ui";
import * as types from "../types";

export type Tag<T extends types.ApiModelTagType = types.ApiModelTagType> =
  T extends types.ApiModelTagType
    ? types.TypedApiModel<
        T,
        {
          readonly title: string;
          readonly plural_title: string | null;
          readonly order: number;
          readonly color: ui.HexColor | null;
        }
      >
    : never;

export const isTag = (model: types.Model | Tag): model is Tag =>
  (model as Tag).title !== undefined && (model as Tag).color !== undefined;
