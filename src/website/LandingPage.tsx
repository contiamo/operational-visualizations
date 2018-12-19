import * as React from "react";

import { Button, Splash } from "@operational/components";

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
);

export default LandingPage;
