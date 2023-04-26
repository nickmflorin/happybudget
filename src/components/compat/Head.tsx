import NextHead from "next/head";

import * as pages from "application/config/pages";

export type HeadProps = pages.MetaOptions & {
  readonly title?: string;
};

export const Head = ({ title, ...props }: HeadProps): JSX.Element => (
  <NextHead>
    <>
      <title>{title || pages.DEFAULT_PAGE_TITLE}</title>
      {Object.keys(pages.DefaultMetaOptions).map((k: string, index: number) => (
        <meta
          key={index}
          name={k}
          content={
            props[k as keyof pages.MetaOptions] === undefined
              ? pages.DefaultMetaOptions[k as keyof pages.MetaOptions]
              : props[k as keyof pages.MetaOptions]
          }
        />
      ))}
      <link rel="icon" href="/favicon.ico" />
    </>
  </NextHead>
);
