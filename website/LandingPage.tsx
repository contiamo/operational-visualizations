import * as React from "react"
import { render } from "react-dom"
import styled from "react-emotion"

import { Button, HeaderBar, Layout, Logo, OperationalUI, Page, Splash } from "@operational/components"

/**
 * We use require here and _not_ import because
 * we don't want Webpack to deal with .json files
 * and include them in the bundle.
 *
 * We just want to require it at node runtime
 * for the version value.
 */
/* tslint:disable:no-var-requires */
const { version } = require("../package.json")

const Version = styled("div")`
  font-size: 16px;
  font-weight: bold;
  margin-right: 20px;
`

const Header = () => <HeaderBar logo={<Logo name="OperationalUI" />} end={<Version>v{version}</Version>} />

const LandingPage = () => (
  <Splash
    color="#6B42B7"
    title="Operational Visualizations"
    actions={
      <>
        <Button to="/visual-tests">Visual Tests</Button>
        <Button to="https://github.com/contiamo/operational-visualizations/">GitHub</Button>
      </>
    }
  >
    <p>Operational Visualizations ..</p>
  </Splash>
)

export default LandingPage
