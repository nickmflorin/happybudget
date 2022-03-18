import { find, isNil } from "lodash";
import { inferModelFromName } from "./util";

export class ChoiceClass<I extends number = number, N extends string = string> implements Model.Choice<I, N> {
  public readonly id: I;
  public readonly name: N;

  constructor(id: I, name: N) {
    this.id = id;
    this.name = name;
  }
}

class ChoicesClass<CH extends ChoiceClass<I, N>, I extends number = number, N extends string = string> {
  public readonly choices: CH[];

  constructor(choices: CH[]) {
    this.choices = choices;
  }

  get = (lookup: I | N): CH => {
    let ch: CH | undefined;
    if (typeof lookup === "number") {
      ch = find(this.choices, { id: lookup }) as CH | undefined;
    } else {
      ch = find(this.choices, (c: CH) => c.name === lookup) as CH | undefined;
    }
    if (isNil(ch)) {
      throw new Error(`Could not find choice for lookup ${lookup}.`);
    }
    return ch;
  };

  infer = (name: string, options?: Omit<Model.InferModelFromNameParams<CH>, "getName">) =>
    inferModelFromName(this.choices, name, { caseInsensitive: false, ...options });
}

export const Choice = <I extends number = number, N extends string = string>(id: I, name: N): ChoiceClass<I, N> =>
  new ChoiceClass<I, N>(id, name);

export const Choices = <CH extends ChoiceClass<I, N>, I extends number = number, N extends string = string>(
  choices: CH[]
): Model.Choices<CH, I, N> => {
  const chClass = new ChoicesClass<CH, I, N>(choices);

  const dynamic: Model.DynamicChoices<CH, I, N> = {} as Model.DynamicChoices<CH, I, N>;
  for (let i = 0; i < choices.length; i++) {
    dynamic[choices[i].name] = choices[i];
  }

  return { ...chClass, ...dynamic };
};
