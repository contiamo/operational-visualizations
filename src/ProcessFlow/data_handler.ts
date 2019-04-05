import { extend, find, flow, forEach, get, groupBy, LodashExtend, map, sortBy, times } from "lodash/fp";
import Layout from "./layout";
import Link from "./link";
import Node from "./node";
import { ComputedWriter, Data, Journey, LinkAttrs, NodeAttrs, State, TLink, TNode, WithConvert } from "./typings";

class DataHandler {
  private journeys!: Journey[];
  private nodes!: TNode[];
  private links!: TLink[];
  private state: State;
  private computedWriter: ComputedWriter;
  private layout: Layout;

  constructor(state: State, computedWriter: ComputedWriter) {
    this.state = state;
    this.computedWriter = computedWriter;
    this.layout = new Layout();
  }

  public prepareData(): Data {
    const data = this.state.current.getData();
    const dataAccessors = this.state.current.getAccessors().data;
    this.journeys = dataAccessors.journeys(data);
    this.initializeNodes(dataAccessors.nodes(data));
    this.initializeLinks();
    this.layout.computeLayout(this.nodes);
    this.positionNodes();
    return {
      nodes: this.nodes,
      journeys: this.journeys,
      links: this.links,
    };
  }

  private initializeNodes(nodeAttrs: NodeAttrs[]) {
    this.nodes = map((attrs: NodeAttrs) => this.addNode(attrs))(nodeAttrs);
    forEach((node: TNode) => {
      node.sourceLinks = [];
      node.targetLinks = [];
    })(this.nodes);
    this.calculateNodeSizes();
    this.calculateStartsAndEnds();
  }

  private findNode(nodeId: string): TNode {
    const node = find((n: TNode) => n.id() === nodeId)(this.nodes);
    if (!node) {
      throw new Error(`No node with id '${nodeId}' defined.`);
    }
    return node;
  }

  private addNode(attrs: NodeAttrs) {
    (extend as WithConvert<LodashExtend>).convert({ immutable: false })(attrs, { size: 0 });
    return new Node(attrs, this.state.current.getAccessors().node);
  }

  private calculateNodeSizes() {
    forEach((journey: Journey) => {
      forEach((nodeId: string) => {
        this.findNode(nodeId).attributes.size += journey.size;
      })(journey.path);
    })(this.journeys);
  }

  private calculateStartsAndEnds() {
    forEach((journey: Journey) => {
      if (journey.path.length > 1) {
        this.findNode(journey.path[0]).journeyStarts += journey.size;
        this.findNode(journey.path[journey.path.length - 1]).journeyEnds += journey.size;
      } else {
        this.findNode(journey.path[0]).singleNodeJourneys += journey.size;
      }
    })(this.journeys);
  }

  private initializeLinks() {
    this.links = [];
    this.computeLinks();
  }

  private findLink(sourceId: string, targetId: string) {
    const checkIds = (link: TLink) => link.sourceId() === sourceId && link.targetId() === targetId;
    return find(checkIds)(this.links);
  }

  private addLink(attrs: LinkAttrs) {
    return new Link(attrs, this.state.current.getAccessors().link);
  }

  private computeLinks() {
    forEach((journey: Journey) => {
      const path = journey.path;
      const computeLink = (i: number) => {
        const sourceId = path[i];
        const targetId = path[i + 1];
        const sourceNode = this.findNode(sourceId);
        const targetNode = this.findNode(targetId);

        const existingLink = this.findLink(sourceId, targetId);
        if (existingLink) {
          existingLink.attributes.size += journey.size;
        } else {
          const linkAttrs: LinkAttrs = {
            source: sourceNode,
            sourceId: sourceNode.id(),
            target: targetNode,
            targetId: targetNode.id(),
            size: journey.size,
          };
          const newLink = this.addLink(linkAttrs);
          this.links.push(newLink);
          sourceNode.sourceLinks.push(newLink);
          targetNode.targetLinks.push(newLink);
        }
      };
      times(computeLink)(path.length - 1);
    })(this.journeys);
  }

  private xGridSpacing() {
    const config = this.state.current.getConfig();
    const finiteWidth = isFinite(config.width);
    const xValues = map(get("x"))(this.layout.nodes);
    const maxX = xValues.length > 0 ? Math.max(...xValues) : 0;
    const spacing = finiteWidth
      ? Math.min(config.width / (maxX + 1), config.horizontalNodeSpacing)
      : config.horizontalNodeSpacing;

    this.computedWriter("horizontalNodeSpacing", spacing);
    this.computedWriter("width", finiteWidth ? config.width : spacing * (maxX + 1));
    return spacing;
  }

  private yGridSpacing(nRows: number) {
    const config = this.state.current.getConfig();
    const finiteHeight = isFinite(config.height);
    const spacing = isFinite(config.height)
      ? Math.min(config.height / (nRows + 1), config.verticalNodeSpacing)
      : config.verticalNodeSpacing;

    this.computedWriter("height", finiteHeight ? config.height : spacing * (nRows + 1));
    return spacing;
  }

  private positionNodes() {
    const nodesByRow = groupBy("y")(this.layout.nodes);
    const rows = Object.keys(nodesByRow);
    const xGridSpacing = this.xGridSpacing();
    const yGridSpacing = this.yGridSpacing(rows.length);

    // Assign y values
    forEach((node: TNode) => {
      node.y = (node.y + 1) * yGridSpacing;
    })(this.layout.nodes);

    // Assign x values
    forEach((row: string) => {
      flow(
        sortBy(get("x")),
        forEach((node: TNode) => {
          node.x *= xGridSpacing;
        }),
      )(nodesByRow[parseInt(row, 10)]);
    })(rows);
  }
}

export default DataHandler;
