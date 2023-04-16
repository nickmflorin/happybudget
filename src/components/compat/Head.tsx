import NextHead from "next/head";

import { config } from "application";

export type HeadProps = config.MetaOptions & {
  readonly title?: string;
};

export const Head = ({ title, ...props }: HeadProps): JSX.Element => (
  <NextHead>
    <>
      <title>{title || config.DEFAULT_PAGE_TITLE}</title>
      {Object.keys(config.DefaultMetaOptions).map((k: string, index: number) => (
        <meta
          key={index}
          name={k}
          content={
            props[k as keyof config.MetaOptions] === undefined
              ? config.DefaultMetaOptions[k as keyof config.MetaOptions]
              : props[k as keyof config.MetaOptions]
          }
        />
      ))}
      <link rel="icon" href="/favicon.ico" />
    </>
  </NextHead>
);
