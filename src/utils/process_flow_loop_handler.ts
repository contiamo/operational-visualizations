import { drop, dropRight, forEach, map, uniq } from "lodash/fp";
import { Journey } from "../ProcessFlow/typings";

type Path = string[];

type NodesList = string[];

interface Node {
  linkedToFrom: string[];
}

interface Nodes {
  [id: string]: Node;
}

const nodes: Nodes = {};

function findNode(nodeId: string) {
  if (!nodes[nodeId]) {
    nodes[nodeId] = { linkedToFrom: [] };
  }
  return nodes[nodeId];
}

function getSourcesRecursively(sources: NodesList): NodesList {
  const numberOfLinks: number = sources.length;
  let sourcesList: NodesList = sources;
  forEach((sourceId: string) => {
    sourcesList = sourcesList.concat(findNode(sourceId).linkedToFrom);
  })(sources);
  const uniqueSources = uniq(sourcesList);

  return uniqueSources.length > numberOfLinks ? getSourcesRecursively(uniqueSources) : uniqueSources;
}

function isLinkedToFrom(sourceId: string, targetId: string) {
  const sourceNodes = findNode(sourceId).linkedToFrom;
  const sourceLinkedToFrom = getSourcesRecursively(sourceNodes);
  return sourceId === targetId || sourceLinkedToFrom.indexOf(targetId) > -1;
}

function removeLoops(path: Path) {
  let i = 1;
  let newPath = path;
  function checkForLoops(pathLeft: Path) {
    let suffix = "";
    const sourceNodeId = pathLeft[0],
      targetNodeId = pathLeft[1];
    let remainingPath = drop(1)(pathLeft);
    if (isLinkedToFrom(sourceNodeId, targetNodeId)) {
      suffix = "+";
      remainingPath = map((nodeId: string) => nodeId + suffix)(remainingPath);
      newPath = dropRight(newPath.length - i)(newPath).concat(remainingPath);
    }
    const targetNode = findNode(targetNodeId + suffix);
    targetNode.linkedToFrom = uniq(targetNode.linkedToFrom.concat(dropRight(newPath.length - i)(newPath)));
    i = i + 1;
    if (remainingPath.length > 1) {
      checkForLoops(remainingPath);
    }
  }
  checkForLoops(newPath);
  return newPath;
}

export default (journeys: Journey[]) => {
  forEach((journey: Journey) => {
    journey.path = removeLoops(journey.path);
  })(journeys);
  return journeys;
};
