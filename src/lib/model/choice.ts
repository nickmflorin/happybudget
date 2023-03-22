import { find } from "lodash";

import { inferModelFromName, InferModelFromNameOptions } from "./lookup";

export type IChoice<
  I extends number = number,
  N extends string = string,
  S extends string = string,
> = {
  id: I;
  name: N;
  slug: S;
};

export type DynamicChoices<
  CH extends IChoice<I, N, S>,
  I extends number = number,
  N extends string = string,
  S extends string = string,
> = {
  [key in CH["slug"]]: CH;
};

export type IChoices<
  CH extends IChoice<I, N, S>,
  I extends number = number,
  N extends string = string,
  S extends string = string,
> = {
  readonly choices: CH[];
  readonly get: (id: I | S) => CH;
  readonly infer: (
    name: string,
    options?: Omit<InferModelFromNameOptions<CH>, "getName">,
  ) => CH | null;
} & DynamicChoices<CH, I, N, S>;

export class ChoiceClass<
  I extends number = number,
  N extends string = string,
  S extends string = string,
> implements IChoice<I, N, S>
{
  public readonly id: I;
  public readonly name: N;
  public readonly slug: S;

  constructor(id: I, name: N, slug: S) {
    this.id = id;
    this.name = name;
    this.slug = slug;
  }
}

class ChoicesClass<
  CH extends ChoiceClass<I, N, S>,
  I extends number = number,
  N extends string = string,
  S extends string = string,
> {
  public readonly choices: CH[];

  constructor(choices: CH[]) {
    this.choices = choices;
  }

  get = (lookup: I | S): CH => {
    let ch: CH | undefined;
    if (typeof lookup === "number") {
      ch = find(this.choices, { id: lookup }) as CH | undefined;
    } else {
      ch = find(this.choices, (c: CH) => c.slug === lookup);
    }
    if (ch === undefined) {
      throw new Error(`Could not find choice for lookup ${lookup}.`);
    }
    return ch;
  };

  infer = (name: string, options?: Omit<InferModelFromNameOptions<CH>, "getName">) =>
    inferModelFromName<ChoiceClass>(this.choices, name, { caseInsensitive: false, ...options });
}

export const Choice = <
  I extends number = number,
  N extends string = string,
  S extends string = string,
>(
  id: I,
  name: N,
  slug: S,
): ChoiceClass<I, N, S> => new ChoiceClass<I, N, S>(id, name, slug);

export const Choices = <
  CH extends ChoiceClass<I, N, S>,
  I extends number = number,
  N extends string = string,
  S extends string = string,
>(
  choices: CH[],
): IChoices<CH, I, N, S> => {
  const chClass = new ChoicesClass<CH, I, N, S>(choices);

  const dynamic: DynamicChoices<CH, I, N, S> = {} as DynamicChoices<CH, I, N, S>;
  for (let i = 0; i < choices.length; i++) {
    dynamic[choices[i].slug] = choices[i];
  }
  return { ...chClass, ...dynamic } as IChoices<CH, I, N, S>;
};
