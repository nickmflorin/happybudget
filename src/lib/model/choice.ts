import { find } from "lodash";

import { toLiteralAccessor } from "../util/literals";
import { type LiteralsAccessor, ExtractValues } from "../util/types";

import { inferModelFromName, InferModelFromNameOptions } from "./lookup";

export type Choice<
  I extends number = number,
  N extends string = string,
  S extends string = string,
> = {
  id: I;
  name: N;
  slug: S;
};

export const choice = <I extends number, N extends string, S extends string>(
  id: I,
  name: N,
  slug: S,
): Choice<I, N, S> => ({
  id,
  name,
  slug,
});

type DynamicChoices<CS extends readonly Choice[]> = {
  [key in CS[number]["slug"] as LiteralsAccessor<key>]: ChoiceForSlug<key, CS>;
};

type ChoiceForId<I extends CS[number]["id"], CS extends readonly Choice[]> = ExtractValues<{
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  [key in keyof CS as CS[key] extends Choice<infer Id extends I> ? key : never]: CS[key];
}>;

type ChoiceForSlug<S extends CS[number]["slug"], CS extends readonly Choice[]> = ExtractValues<{
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  [key in keyof CS as CS[key] extends Choice<number, string, infer Sl extends S>
    ? key
    : never]: CS[key];
}>;

type ChoiceForIdOrSlug<
  S extends CS[number]["slug"] | CS[number]["id"],
  CS extends readonly Choice[],
> = S extends CS[number]["slug"]
  ? ChoiceForSlug<S, CS>
  : S extends CS[number]["id"]
  ? ChoiceForId<S, CS>
  : never;

export type Choices<CS extends readonly Choice[]> = {
  readonly choices: CS;
  readonly get: <I extends CS[number]["id"] | CS[number]["slug"]>(
    id: I,
  ) => ChoiceForIdOrSlug<I, CS>;
  readonly infer: (
    name: string,
    options?: Omit<InferModelFromNameOptions<CS[number]>, "getName">,
  ) => CS[number] | null;
} & DynamicChoices<CS>;

export const choices = <CS extends readonly Choice[]>(choices: CS): Choices<CS> => ({
  ...choices.reduce(
    (prev: DynamicChoices<CS>, curr: CS[number]) => ({
      ...prev,
      [toLiteralAccessor(curr.slug)]: curr,
    }),
    {} as DynamicChoices<CS>,
  ),
  choices,
  get<I extends CS[number]["id"] | CS[number]["slug"]>(
    this: Choices<CS>,
    lookup: I,
  ): ChoiceForIdOrSlug<I, CS> {
    let choice: ChoiceForIdOrSlug<I, CS> | undefined;
    if (typeof lookup === "number") {
      choice = find(this.choices, { id: lookup }) as ChoiceForIdOrSlug<I, CS> | undefined;
    } else {
      choice = find(this.choices, (c: CS[number]) => c.slug === lookup) as
        | ChoiceForIdOrSlug<I, CS>
        | undefined;
    }
    if (choice === undefined) {
      throw new Error(`Could not find choice for lookup ${lookup}.`);
    }
    return choice;
  },
  infer(
    this: Choices<CS>,
    name: string,
    options?: Omit<InferModelFromNameOptions<CS[number]>, "getName">,
  ) {
    return inferModelFromName(this.choices.slice(), name, {
      caseInsensitive: false,
      ...options,
    });
  },
});
