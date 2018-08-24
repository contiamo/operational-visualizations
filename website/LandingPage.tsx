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
    color="#343972"
    title="Operational Visualizations"
    actions={
      <>
        <Button to="/visual-tests">Explore</Button>
        <Button to="https://github.com/contiamo/operational-visualizations/">GitHub</Button>
      </>
    }
  >
    <p>
      Operational Visualizations is a set of robust and opinionated visualizations ready for enterprise volume and
      complexity, from simple line charts to fully custom process visualization algorithms.
    </p>
    <p>Just bring your own data 🤓</p>
  </Splash>
)

export default LandingPage
