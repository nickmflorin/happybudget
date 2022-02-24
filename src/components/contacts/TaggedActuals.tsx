import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { map } from "lodash";

import * as api from "api";

import { Pagination, RenderOrSpinner, NoData } from "components";
import TaggedActual from "./TaggedActual";

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
  const [responseWasReceived, setResponseWasReceived] = useState(false);
  const [getToken] = api.useCancelToken();

  useEffect(() => {
    setLoading(true);
    setResponseWasReceived(false);
    api
      .getContactTaggedActuals(contactId, { page_size: 5, page }, { cancelToken: getToken() })
      .then((response: Http.ListResponse<Model.TaggedActual>) => {
        setTaggedActuals(response.data);
        setCount(response.count);
        setResponseWasReceived(true);
      })
      .catch((e: Error) => onError(e))
      .finally(() => setLoading(false));
  }, [props.id, page]);

  return (
    <div {...props} className={classNames("tagged-actuals", props.className)}>
      <div className={"tagged-actuals-header"}>
        <h4 className={"tagged-actuals-title"}>{title}</h4>
        <Pagination
          hideOnSinglePage={true}
          small={true}
          defaultPageSize={5}
          pageSize={5}
          current={page}
          total={count}
          onChange={(pg: number) => setPage(pg)}
        />
      </div>
      <RenderOrSpinner loading={loading}>
        {responseWasReceived && taggedActuals.length === 0 ? (
          <NoData subTitle={"No history"} />
        ) : (
          <React.Fragment>
            {map(taggedActuals, (a: Model.TaggedActual, i: number) => (
              <TaggedActual taggedActual={a} key={i} />
            ))}
          </React.Fragment>
        )}
      </RenderOrSpinner>
    </div>
  );
};

export default React.memo(TaggedActuals);
