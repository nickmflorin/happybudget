import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { map } from "lodash";

import * as api from "api";

import { Pagination } from "components";
import { RenderOrSpinner } from "components/loading";
import TaggedActual from "./TaggedActual";

import "./TaggedActuals.scss";

type TaggedActualsProps = StandardComponentProps & {
  readonly contactId: number;
  readonly title: string;
  readonly onError: (e: Error) => void;
};

const TaggedActuals = ({ contactId, title, onError, ...props }: TaggedActualsProps): JSX.Element => {
  const [taggedActuals, setTaggedActuals] = useState<Model.TaggedActual[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [getToken] = api.useCancelToken();

  useEffect(() => {
    setLoading(true);
    // TODO: We need to build in pagination here.
    api
      .getContactTaggedActuals(contactId, { page_size: 5, page }, { cancelToken: getToken() })
      .then((response: Http.ListResponse<Model.TaggedActual>) => {
        setTaggedActuals(response.data);
        setCount(response.count);
      })
      .catch((e: Error) => onError(e))
      .finally(() => setLoading(false));
  }, [props.id, page]);

  return (
    <div {...props} className={classNames("tagged-actuals", props.className)}>
      <div className={"tagged-actuals-header"}>
        <h3 className={"tagged-actuals-title"}>{title}</h3>
        <Pagination
          hideOnSinglePage={false}
          small={true}
          subtle={true}
          defaultPageSize={5}
          pageSize={5}
          current={page}
          total={count}
          onChange={(pg: number) => setPage(pg)}
        />
      </div>
      <RenderOrSpinner loading={loading}>
        {map(taggedActuals, (a: Model.TaggedActual, i: number) => (
          <TaggedActual taggedActual={a} key={i} />
        ))}
      </RenderOrSpinner>
    </div>
  );
};

export default React.memo(TaggedActuals);
