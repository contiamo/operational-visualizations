import * as React from "react"
import styled from "react-emotion"
import { Sunburst, VisualizationWrapper } from "../src"

import {
  OperationalUI,
  Layout,
  Button,
  Card,
  HeaderBar,
  Sidenav,
  SidenavHeader,
  SidenavItem,
  Logo,
  Page,
} from "@operational/components"

import Marathon, { MarathonEnvironment } from "./Marathon"
import MarathonRenderer from "./MarathonRenderer"
import allTestCases, { fromPathname, toPathname, next } from "./TestCases"

export interface Props {
  pushState: (path: string) => void
  pathname: string
}

export interface State {
  isLooping: boolean
}

class VisualTests extends React.Component<Props, State> {
  state = {
    isLooping: false,
  }

  syncPath() {
    const { groupIndex, testIndex, exactPath } = fromPathname(this.props.pathname)
    if (exactPath) {
      return
    }
    this.props.pushState(toPathname({ groupIndex, testIndex }))
  }

  componentDidMount() {
    this.syncPath()
  }

  componentDidUpdate() {
    this.syncPath()
  }

  render() {
    const pathInfo = fromPathname(this.props.pathname)
    const { groupIndex, testIndex } = pathInfo
    return (
      <Layout
        header={<HeaderBar main={<h3>Visual Tests</h3>} logo={<Logo name="OperationalUI" to="/" />} />}
        sidenav={
          <Sidenav>
            {allTestCases.map((testGroup, groupIndex) => (
              <SidenavHeader
                key={groupIndex}
                to={toPathname({ groupIndex, testIndex: 0 })}
                label={testGroup.title}
                active
              >
                {testGroup.children.map((test, testIndex) => {
                  const pathname = toPathname({ groupIndex, testIndex })
                  return (
                    <SidenavItem
                      key={testIndex}
                      active={pathname === this.props.pathname}
                      to={pathname}
                      label={test.title}
                    />
                  )
                })}
              </SidenavHeader>
            ))}
          </Sidenav>
        }
        main={
          <Page
            title="Canvas"
            actions={
              <>
                <Button
                  icon="Open"
                  condensed
                  color="ghost"
                  to={`https://github.com/contiamo/operational-visualizations/blob/master/visual-tests/TestCases/${
                    allTestCases[groupIndex].folder
                  }/${allTestCases[groupIndex].children[testIndex].slug}.ts`}
                >
                  View Code
                </Button>
                <Button
                  condensed
                  color="ghost"
                  icon={this.state.isLooping ? "Pause" : "Play"}
                  onClick={() => {
                    this.setState(prevState => ({
                      isLooping: !prevState.isLooping,
                    }))
                  }}
                >
                  {this.state.isLooping ? "Pause" : "Run all"}
                </Button>
              </>
            }
          >
            <Card>
              {pathInfo.exactPath && (
                <Marathon
                  test={allTestCases[groupIndex].children[testIndex].marathon}
                  onCompleted={() => {
                    if (this.state.isLooping) {
                      this.props.pushState(toPathname(next({ groupIndex, testIndex })))
                    }
                  }}
                  timeout={2000}
                >
                  {MarathonRenderer}
                </Marathon>
              )}
            </Card>
          </Page>
        }
      />
    )
  }
}

export default VisualTests
