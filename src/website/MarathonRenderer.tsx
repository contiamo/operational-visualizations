import { OperationalStyleConstants, ProgressPanel } from "@operational/components";
import * as React from "react";
import styled from "react-emotion";
import { MarathonRenderer } from "./Marathon";

const Content = styled("div")(
  {
    padding: 20,
    marginTop: 20,
  },
  ({ theme }: { theme?: OperationalStyleConstants }) => ({
    backgroundColor: (theme && theme.color.background.lighter) || "#fff",
    borderRadius: 4,
  }),
);

type Status = "waiting" | "todo" | "running" | "success" | "failure" | "done" | "failed";

const MarathonRendererComponent = ({ results, ref }: MarathonRenderer) => (
  <>
    <ProgressPanel
      items={results.map((result, index) => ({
        title: result.description,
        status: ((): Status => {
          if (!result.isCompleted) {
            return index === 0 || results[index - 1].isCompleted ? "running" : "waiting";
          }
          if (result.errors.length > 0) {
            return "failure";
          }
          return "success";
        })(),
        error: result.errors.length > 0 ? result.errors.join(" ") : undefined,
      }))}
    />
    <Content innerRef={ref} />
  </>
);

export default MarathonRendererComponent;
