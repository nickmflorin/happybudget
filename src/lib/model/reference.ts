import { uniq } from "lodash";

import { logger } from "internal";

import { formatters, removeObjAttributes } from "../util";

import * as typeguards from "./typeguards";
import * as types from "./types";

const ModelTypeNameMap: { [key in types.ApiModelType]: string } = {
  subaccount: "Sub Account",
  account: "Account",
  fringe: "Fringe",
  actual: "Actual",
  contact: "Contact",
  "pdf-account": "PDF Account",
  "pdf-subaccount": "PDF Sub Account",
  collaborator: "Collaborator",
  markup: "Markup",
  group: "Group",
  budget: "Budget",
  template: "Template",
  "pdf-budget": "PDF Budget",
};

export const modelReferenceType = <M extends types.Model>(m: M): string => {
  if (typeguards.modelIsTypedApiModel(m)) {
    return ModelTypeNameMap[m.type];
  }
  return "Model";
};

type ModelStringReferenceOptions = {
  readonly ignoreAttributes?: string[];
  readonly includeAttributes?: true | string[];
  readonly includeNestedObjects?: true;
  readonly modelName?: string;
};

export function modelStringReference<M extends types.Model>(
  m: M[],
  options: Pick<ModelStringReferenceOptions, "modelName">,
): string;

export function modelStringReference<M extends types.Model>(
  m: M,
  options: ModelStringReferenceOptions,
): string;

export function modelStringReference<M extends types.Model>(
  m: M | M[],
  options?: ModelStringReferenceOptions,
): string {
  if (Array.isArray(m)) {
    if (m.length === 0) {
      logger.warn("Cannot generate a reference from an empty array of models.");
      return options?.modelName !== undefined ? options?.modelName : "Model";
    }
    const model = m[0];
    return options?.modelName !== undefined
      ? options.modelName
      : typeguards.modelIsTypedApiModel(model)
      ? ModelTypeNameMap[model.type]
      : "Model";
  }

  let modelObj: Partial<M> = { id: m.id } as Partial<M>;
  const defaultExclusion = ["id", "type", "created_at", "updated_at"];
  if (options?.includeAttributes) {
    if (options?.ignoreAttributes !== undefined) {
      logger.warn(
        "Both 'ignoreAttributes' and 'includeAttributes' are provided, only 'includeAttributes' " +
          "will be used.",
      );
    }
    if (options?.includeAttributes === true) {
      modelObj = removeObjAttributes<M>(m, defaultExclusion) as Partial<M>;
    } else {
      modelObj = options.includeAttributes.reduce(
        (prev: Partial<M>, attr: string): Partial<M> =>
          attr in m ? { ...prev, [attr]: m[attr as keyof M] } : { ...prev, [attr]: "__MISSING__" },
        { id: m.id } as Partial<M>,
      );
    }
  } else if (options?.ignoreAttributes !== undefined) {
    modelObj = removeObjAttributes<M>(
      m,
      uniq([...defaultExclusion, ...options.ignoreAttributes]) as string[],
    ) as Partial<M>;
  }

  if (options?.includeNestedObjects !== true) {
    modelObj = Object.keys(modelObj).reduce((prev: Partial<M>, attr: string) => {
      const value = modelObj[attr as keyof M];
      if (typeof value === "object" && value !== null) {
        return prev;
      }
      return { ...prev, [attr]: value };
    }, {} as Partial<M>);
  }

  return [
    modelStringReference([m], { modelName: options?.modelName }),
    formatters.stringifyAttributes(modelObj),
  ].join(" ");
}
