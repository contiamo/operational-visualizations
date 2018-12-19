import {
  filter,
  find,
  flow,
  forEach,
  get,
  identity,
  indexOf,
  LodashForEach,
  map,
  reduce,
  sortBy,
  uniq,
} from "lodash/fp";
import { TLink, TNode, WithConvert } from "./typings";

class Layout {
  public nodes!: TNode[];

  public computeLayout(nodes: TNode[]) {
    this.nodes = nodes;
    this.computeNodeYPositions();
    this.computeNodeXPositions();
  }

  // Nodes are assigned the maximum vertical position of incoming neighbors plus one;
  // nodes with no incoming links are considered start nodes.
  private computeNodeYPositions() {
    let nextNodes: TNode[];
    let i: number = 0;
    const assignNextNodes = (nodes: TNode[]) => {
      nextNodes = [];
      forEach((node: TNode) => {
        node.y = i;
        forEach((link: TLink) => {
          if (indexOf(link.target())(nextNodes) < 0) {
            nextNodes.push(link.target());
          }
        })(node.sourceLinks);
      })(nodes);
      if (nextNodes.length > 0 && i < this.nodes.length) {
        if (nodes.length === nextNodes.length) {
          throw new Error(
            "The data contains at least one loop. Handle loops before rendering, by passing the journeys through the ProcessFlowLoopHandler from the `contiamo-visualizations` package.",
          );
        }
        i = i + 1;
        assignNextNodes(nextNodes);
      }
    };
    assignNextNodes(this.nodes);
  }

  private placeMultipleSourceNodes(nodesInRow: TNode[], nodePositions: number[]) {
    const multipleSourceNodes: TNode[] = filter((node: TNode): boolean => node.targetLinks.length > 1)(nodesInRow);
    forEach((node: TNode) => {
      const sourcePositions: number[] = map((link: TLink): number => link.source().x)(node.targetLinks);
      // A node should be placed directly under a source node if possible:
      // Calculate possible node x positions that satisfy the following conditions
      const possiblePositions = flow(
        // 1) there can only be one source node directly above
        filter(singleSourceAbove(sourcePositions)),
        // 2) there cannot be another (non-source) node in between the node and the source node above
        filter(isSourceDirectlyAbove(node, this.nodes)),
        // 3) there can't already be another node on the same row in that position
        filter(xPositionAvailable(nodePositions)),
      )(sourcePositions);

      const calculated = calculateXPosition(sourcePositions, possiblePositions);
      if (calculated.isNewColumn) {
        shiftNodesToRight(calculated.xPosition)(this.nodes);
      }
      node.x = calculated.xPosition;
      nodePositions.push(calculated.xPosition);
    })(multipleSourceNodes);
  }

  private computeNodeXPositions() {
    const rows: number[] = flow(
      map(get("y")),
      sortBy(identity),
      uniq,
    )(this.nodes);

    forEach((row: number) => {
      const nodesInRow: TNode[] = filter((node: TNode) => node.y === row)(this.nodes);
      if (row === 0) {
        // For the top row, spread nodes out equally
        (forEach as WithConvert<LodashForEach>).convert({ cap: false })((node: TNode, i: number) => {
          node.x = i + 1;
        })(nodesInRow);
      } else {
        const nodePositions: number[] = [];
        // Place nodes with only one incoming link directly below their source node, if possible.
        placeSingleSourceNodes(nodesInRow, nodePositions);
        // If there are more than 1 incoming links, calculate optimal x position for node,
        //  and move other nodes as required.
        this.placeMultipleSourceNodes(nodesInRow, nodePositions);
      }
    })(rows);
  }
}

// Helper functions
function placeNode(used: number[], x: number, node: TNode) {
  if (indexOf(x)(used) > -1) {
    placeNode(used, x + 1, node);
  } else {
    node.x = x;
    used.push(x);
  }
}

function placeSingleSourceNodes(nodesInRow: TNode[], nodePositions: number[]) {
  const singleSourceNodes: TNode[] = filter((node: TNode): boolean => node.targetLinks.length === 1)(nodesInRow);
  forEach((node: TNode) => {
    const sourceNodePosition: number = node.targetLinks[0].source().x;
    placeNode(nodePositions, sourceNodePosition, node);
  })(singleSourceNodes);
}

function singleSourceAbove(sourcePositions: number[]) {
  function sourceNodesAbove(x: number) {
    return filter((position: number) => position === x)(sourcePositions);
  }
  return (x: number) => sourceNodesAbove(x).length === 1;
}

// Check that there isn't a non-source node vertically between 2 linked nodes.
function isSourceDirectlyAbove(node: TNode, nodes: TNode[]) {
  return (xValue: number) => {
    const sourceNode = find((link: TLink): boolean => link.source().x === xValue)(node.targetLinks);
    if (!sourceNode) {
      throw new Error(`No source node found at x position: ${xValue}`);
    }
    const maxYVal = flow(
      filter((n: TNode) => n.x === xValue),
      reduce((max: number, n: TNode) => Math.max(max, n.y), 0),
    )(nodes);
    return maxYVal === sourceNode.source().y;
  };
}

function xPositionAvailable(nodePositions: number[]) {
  return (x: number) => indexOf(x)(nodePositions) === -1;
}

// Shift all nodes that have an x-value >= the given value to the right by one place
function shiftNodesToRight(x: number) {
  return flow(
    filter((n: TNode): boolean => n.x >= x),
    forEach((n: TNode) => {
      n.x += 1;
    }),
  );
}

// The mean source node position is calculated as a starting point for positioning the node
function calculateXPosition(
  sourcePositions: number[],
  possiblePositions: number[],
): { xPosition: number; isNewColumn: boolean } {
  let isNewColumn = false;
  const sourcePositionsSum: number = reduce((sum: number, val: number): number => {
    return sum + val;
  }, 0)(sourcePositions);
  const meanSourcePosition = sourcePositionsSum / sourcePositions.length;
  let xPosition: number;
  if (possiblePositions.length > 0) {
    const sortedPossibilities = sortBy((x: number) => Math.abs(x - meanSourcePosition))(possiblePositions);
    xPosition = sortedPossibilities[0];
  } else {
    xPosition = Math.round(meanSourcePosition);
    // Shift nodes to the right by one place to make space for new node column
    isNewColumn = true;
  }
  return { xPosition, isNewColumn };
}

export default Layout;
