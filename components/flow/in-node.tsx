import { Edge, Handle, type Node, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";

import { NodeType, StatefulChip, StatefulWire } from "@/lib/types/flow";
import { cn, getActiveColor, getBgColor, getBorderColor } from "@/lib/utils";

import { useChips } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;

export function InNode(props: NodeProps<Node<StatefulChip>>) {
  const { data, selected } = props;
  const getChip = useChips((state) => state.getChip);

  const CHIP_DEFINITION = getChip(NodeType.IN);
  const COLOR = data.color || CHIP_DEFINITION?.color;
  const VALUE = data?.ports?.[0]?.value;

  const { updateNodeData, getEdges, getNode, updateEdgeData } = useReactFlow<Node<StatefulChip>, Edge<StatefulWire>>();

  // handle click on port
  const handleClick = (e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();
    console.log("--------------IN NODE--------------");
    console.log("VALUE", VALUE);
    // console.log("data.ports", data.ports);

    if (!data.ports || data.ports.length === 0) {
      return;
    }
    // const portId = data.ports[0].id;
    // propagateValues(data.id, portId, !VALUE);
    updateNodeData(data.id, {
      ports: data.ports?.map((port) => ({ ...port, value: !VALUE })),
    });
  };

  const propagateValues = (nodeId: string, portId: string, value: boolean) => {
    console.log("---------------------PROPAGATE VALUES---------------------");
    const node = getNode(nodeId);
    console.log("NODE NAME:", node?.data.name);
    console.log("nodeId", nodeId, "portId", portId, "value", value);
    console.log("node", node);
    if (!node) {
      return;
    }

    if (!node.data.ports) {
      return;
    }

    // check portId belong to node
    const port = node.data.ports.find((port) => port.id === portId);
    if (!port) {
      return;
    }

    console.log("port", port);

    // update node value

    const newPorts = node.data.ports.map((port) => (port.id === portId ? { ...port, value: value } : port));
    console.log("newPorts", newPorts);
    updateNodeData(nodeId, {
      ports: newPorts,
    });

    // update output port value (compute)
    // const node2 = getNode(nodeId);
    // if (!node2) {
    //   return;
    // }
    // console.log("node2", node2);

    const inputPortValues = newPorts?.map((port) => ({
      name: port.name,
      value: port.value as boolean,
    }));

    console.log("inputPortValues", inputPortValues);

    const outputChipValues = computeOutputChip(node.data.name, inputPortValues);

    console.log("outputChipValues", outputChipValues);

    if (!outputChipValues || outputChipValues.length === 0) {
      return;
    }

    for (const outputPortValue of outputChipValues) {
      // update output port value
      updateNodeData(nodeId, {
        ports: node.data.ports?.map((port) =>
          port.name === outputPortValue.name ? { ...port, value: outputPortValue.value } : port,
        ),
      });

      // update after edges values
      console.log("portId", portId);
      console.log("getEdges", getEdges());
      const afterEdges = getEdges().filter((edge) => edge.source === nodeId);
      console.log("afterEdges", afterEdges);

      if (afterEdges.length === 0) {
        continue;
      }

      for (const edge of afterEdges) {
        updateEdgeData(edge.id, { value: outputPortValue.value });

        if (!edge.targetHandle) {
          continue;
        }
        // propagate values
        // return;
        propagateValues(edge.target, edge.targetHandle, outputPortValue.value);
      }
    }
  };

  type IdValue = { name: string; value: boolean };

  const computeOutputChip = (chipName: string, inputValues?: IdValue[]): IdValue[] | null => {
    console.log("---------------------COMPUTE OUTPUT CHIP---------------------");
    console.log("chipName", chipName, "inputValues", inputValues);
    const CHIP_DEFINITION = getChip(chipName);

    if (!CHIP_DEFINITION) {
      return null;
    }

    if (CHIP_DEFINITION.type === NodeType.IN) {
      return inputValues || [];
    }

    if (CHIP_DEFINITION.type === NodeType.OUT) {
      return null;
    }

    if (CHIP_DEFINITION.type === NodeType.CHIP) {
      if (chipName === "NAND") {
        const nandInputs = inputValues?.filter((input) => input.name === "a" || input.name === "b");
        return [{ name: "out", value: !(nandInputs?.[0].value && nandInputs?.[1].value) }];
      } else {
        if (!CHIP_DEFINITION.nodes) {
          return null;
        }

        const outputNodes = CHIP_DEFINITION.nodes.filter((node) => node.type === NodeType.OUT);
        if (!outputNodes) {
          return null;
        }

        let outputValues: IdValue[] = outputNodes.map((node) => ({ name: node.name, value: false })) || [];

        for (const outputNode of outputNodes) {
          // find edge
          const edges = CHIP_DEFINITION.edges?.filter((edge) => edge.targetId === outputNode.id);
          if (!edges) {
            continue;
          }

          for (const edge of edges) {
            const prevNode = CHIP_DEFINITION.nodes?.find((node) => node.id === edge.sourceId);

            if (!prevNode) {
              continue;
            }

            const prevNodeOutputs = computeOutputChip(prevNode.name, inputValues);

            // update
            if (!prevNodeOutputs) {
              continue;
            }

            for (const prevNodeOutput of prevNodeOutputs) {
              //   outputValues.({ name: prevNodeOutput.name, value: prevNodeOutput.value });
              outputValues = outputValues.map((output) =>
                output.name === prevNodeOutput.name ? { ...output, value: prevNodeOutput.value } : output,
              );
            }
          }
        }

        return outputValues;
      }
    }

    return null;
  };

  return (
    <div className={cn("relative font-mono rounded-sm", selected && "outline-ring outline-1")}>
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 28 24">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill={VALUE ? getActiveColor(COLOR) : getBgColor(COLOR)}
          stroke={getBorderColor(COLOR)}
          strokeWidth="1"
          className="cursor-pointer"
          onClick={handleClick}
        />
        <line
          x1="22"
          y1="12"
          x2="28"
          y2="12"
          stroke={VALUE ? getActiveColor(COLOR) : getBorderColor(COLOR)}
          strokeWidth="2"
        />
      </svg>

      {/* Input ports */}
      <Handle
        data-active={VALUE}
        id={data.ports?.[0]?.id}
        type="source"
        position={Position.Right}
        style={{
          height: PORT_HEIGHT,
          width: PORT_WIDTH,
          borderRadius: 100,
          border: "none",
        }}
      />
    </div>
  );
}
