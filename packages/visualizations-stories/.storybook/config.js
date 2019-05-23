import "storybook-chromatic";
import { addParameters, configure } from "@storybook/react";

addParameters({
  options: {
    name: "@operational/visualizations",
    url: "https://github.com/contiamo/operational-visualizations",
    hierarchySeparator: "/",
    showAddonPanel: false,
  },
});

// Automatically import all files ending in *.stories.tsx
const req = require.context("../src", true, /.stories.tsx$/);
function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
