export interface NodeTypes<T> {
  id: string;
  parentId: string;
  payload: T;
  children?: NodeTypes<T>[];
}

interface NodeTreeSortProps<T> {
  nodes: NodeTypes<T>[];
  parent: string | null;
}
const formatNodeTree = <T>({
  nodes,
  parent,
}: NodeTreeSortProps<T>): NodeTypes<T>[] => {
  return nodes
    ?.filter((node) => node.parentId === parent)
    .map((node) => {
      return {
        id: node.id,
        parentId: node.parentId,
        payload: node.payload,
        children: formatNodeTree({
          nodes: nodes,
          parent: node.id,
        }),
      };
    });
};

export { formatNodeTree };
