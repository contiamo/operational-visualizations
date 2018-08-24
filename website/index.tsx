import * as React from "react"
import { render } from "react-dom"
import { OperationalUI } from "@operational/components"

import LandingPage from "./LandingPage"
import VisualTests from "./VisualTests"

class Website extends React.Component<{}, { pathname: string }> {
  state = { pathname: window.location.pathname }

  pushState = (newUrl: string) => {
    this.setState(() => ({ pathname: newUrl }))
    window.history.pushState({}, "", newUrl)
  }

  handlePopState = () => {
    this.setState(() => ({
      pathname: window.location.pathname,
    }))
  }

  componentDidMount() {
    window.addEventListener("popstate", this.handlePopState)
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.handlePopState)
  }

  render() {
    return (
      <OperationalUI pushState={this.pushState}>
        {this.state.pathname === "/" ? (
          <LandingPage />
        ) : (
          <VisualTests pathname={this.state.pathname} pushState={this.pushState} />
        )}
      </OperationalUI>
    )
  }
}

render(<Website />, document.querySelector("#app"))
