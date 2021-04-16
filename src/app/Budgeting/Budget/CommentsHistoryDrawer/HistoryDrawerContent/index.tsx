import { useEffect } from "react";
import { map } from "lodash";
import { Empty } from "antd";

import { RenderWithSpinner, ShowHide } from "components";
import { Drawer } from "components/layout";

import Event from "./Event";
import "./index.scss";

export interface HistoryDrawerContentProps {
  loading: boolean;
  history: Model.HistoryEvent[];
  onRequest: () => void;
}

const HistoryDrawerContent = ({ history, loading, onRequest }: HistoryDrawerContentProps): JSX.Element => {
  useEffect(() => {
    onRequest();
  }, []);

  return (
    <Drawer.Content className={"history-drawer-content"} noPadding>
      <RenderWithSpinner absolute size={15} loading={loading} toggleOpacity={true} color={"#b5b5b5"}>
        <ShowHide show={history.length !== 0}>
          {map(history, (event: Model.HistoryEvent, index: number) => {
            return <Event key={index} event={event} />;
          })}
        </ShowHide>
        <ShowHide show={history.length === 0}>
          <div className={"no-data-wrapper"}>
            <Empty className={"empty"} description={"No Activity!"} />
          </div>
        </ShowHide>
      </RenderWithSpinner>
    </Drawer.Content>
  );
};

export default HistoryDrawerContent;
