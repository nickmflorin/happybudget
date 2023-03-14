/**
 * A generalized form of "@fortawesome/fontawesome-svg-core"'s {@link IconDefinition} that is used
 * to replace a "@fortawesome/fontawesome-svg-core" imported form.
 */
export type NaiveFAIconDefinition = {
  prefix: string;
  iconName: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  icon: [number, number, string[], string, any];
};

/**
 * A generalized form of "@fortawesome/fontawesome-svg-core"'s {@link Config} that used to replace
 * a "@fortawesome/fontawesome-svg-core" imported form.
 */
export interface NaiveFAConfig {
  autoAddCss: boolean;
}
