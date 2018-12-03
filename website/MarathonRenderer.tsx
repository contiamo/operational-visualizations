import * as React from "react"
import styled from "react-emotion"

import { ProgressPanel, OperationalStyleConstants } from "@operational/components"
import { MarathonRenderer } from "./Marathon"

const Content = styled("div")(
  {
    padding: 20,
    marginTop: 20,
  },
  ({ theme }: { theme?: OperationalStyleConstants }) => ({
    backgroundColor: theme.color.background.lighter,
    borderRadius: 4,
  }),
)

const MarathonRendererComponent = ({ results, ref }: MarathonRenderer) => (
  <>
    <ProgressPanel
      items={results.map((result, index) => ({
        title: result.description,
        status: (() => {
          if (!result.isCompleted) {
            return index === 0 || results[index - 1].isCompleted ? "running" : "waiting"
          }
          if (result.errors.length > 0) {
            return "failure"
          }
          return "success"
        })(),
        error: result.errors.length > 0 ? result.errors.join(" ") : undefined,
      }))}
    />
    <Content innerRef={ref} />
  </>
)

export default MarathonRendererComponent
