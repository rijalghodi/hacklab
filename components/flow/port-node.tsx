import { Edge, Handle, type Node, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";

import { builtInChips, builtInPorts } from "@/lib/constants/chips";
import { PortName, StatefulPort, StatefulChip, StatefulWire, StatefulCircuitPort } from "@/lib/types/flow";
import { cn, getActiveColor, getBgColor, getBorderColor } from "@/lib/utils";
import { useSavedChips } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;

export function PortNode(props: NodeProps<Node<StatefulPort>>) {
  const { id, data, selected } = props;
  const { savedChips } = useSavedChips();
  const { updateNodeData, getEdges, getNodes } = useReactFlow<Node<StatefulChip | StatefulPort>, Edge<StatefulWire>>();

  const portName = data.name;
  const portState = data.value;
  const currentPort = builtInPorts.find((port) => port.name === portName);

  // handle click on port
  const handleClick = (e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();
    updateNodeData(id, { value: !portState });

    const edges = getEdges();
    const nodes = getNodes();

    // Calculete the node states

    const currentEdges = edges.filter((edge) => edge.source === id);

    if (currentEdges.length === 0) {
      return;
    }

    for (const edge of currentEdges) {
      const currentNode = nodes.find((node) => node.id === edge?.target);

      if (!currentNode || currentNode.type === "port") {
        continue;
      }

      const data = currentNode.data as StatefulChip;
      const ports = data.ports;

      if (!ports || ports.length === 0) {
        continue;
      }

      // update input port
      const selectedPort = ports.find((port) => port.id === edge?.targetHandle);
      if (selectedPort) {
        updateNodeData(selectedPort.id, { value: !selectedPort.value });
      }

      // update output port

      const outputChip = computeOutputChip(data);

      const outputPorts = outputChip.ports?.filter((port) => port.name === PortName.OUT);
      if (outputPorts) {
        for (const outputPort of outputPorts) {
          updateNodeData(outputPort.id, { value: outputPort.value });
        }
      }
    }

    // console.log("PORT", id, portState);
  };

  const computeOutputChip = (chip: StatefulChip): StatefulChip => {
    const inputPorts = chip.ports?.filter((port) => port.name === PortName.IN);
    const outputPorts = chip.ports?.filter((port) => port.name === PortName.OUT);
    if (!outputPorts || outputPorts.length === 0 || !inputPorts || inputPorts.length === 0) {
      return chip;
    }

    const allChips = [...builtInChips, ...savedChips];
    const chipDefinition = allChips.find((chip) => chip.name === chip.name);

    if (!chipDefinition) {
      return chip;
    }

    // internal ports
    const internalPorts = chipDefinition.ports as StatefulCircuitPort[];
    const internalInputPorts = internalPorts.filter((port) => port.name === PortName.IN);
    if (!internalInputPorts || internalInputPorts.length === 0) {
      return chip;
    }

    // Copy input ports to internal input ports
    for (let i = 0; i < internalInputPorts.length; i++) {
      const inputPort = inputPorts[i];
      if (inputPort) {
        internalInputPorts[i].value = inputPort?.value;
      }
    }

    // Internal chips
    const internalChips = chipDefinition.chips;

    if (!internalChips || internalChips.length === 0) {
      return chip;
    }

    // Do nested recursive actions
    for (const internalChip of internalChips) {
      if (internalChip.name == "NAND") {
        let outputValue = false;
        for (const inputPort of internalInputPorts) {
          outputValue = outputValue && inputPort.value;
        }
        internalInputPorts[0].value = !outputValue;
      } else {
        computeOutputChip(internalChip);
      }
    }

    // copy internal output ports to chip output ports
    for (let i = 0; i < outputPorts.length; i++) {
      outputPorts[i].value = internalInputPorts[i].value;
    }

    chip.ports = outputPorts.concat(inputPorts);

    return chip;
  };

  return (
    <div className={cn("relative font-mono rounded-sm", selected && "outline-ring outline-1")}>
      {portName === PortName.IN && (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 28 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill={portState ? getActiveColor(currentPort?.color) : getBgColor(currentPort?.color)}
            stroke={getBorderColor(currentPort?.color)}
            strokeWidth="1"
            className="cursor-pointer"
            onClick={handleClick}
          />
          <line x1="22" y1="12" x2="28" y2="12" stroke={getBorderColor(currentPort?.color)} strokeWidth="2" />
        </svg>
      )}

      {portName === PortName.OUT && (
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 28 24">
          <circle
            cx="16"
            cy="12"
            r="10"
            fill={portState ? getActiveColor(currentPort?.color) : getBgColor(currentPort?.color)}
            stroke={getBorderColor(currentPort?.color)}
            strokeWidth="1"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              updateNodeData(data.id, { value: !portState });
              console.log("OUT");
            }}
          />
          <line x1="0" y1="12" x2="6" y2="12" stroke={getBorderColor(currentPort?.color)} strokeWidth="2" />
        </svg>
      )}

      {/* Input ports */}
      {portName === PortName.IN && (
        <Handle
          id={data.id}
          type="source"
          position={Position.Right}
          style={{
            height: PORT_HEIGHT,
            width: PORT_WIDTH,
            borderRadius: 100,
            border: "none",
          }}
        />
      )}

      {/* Output ports */}
      {portName === PortName.OUT && (
        <Handle
          id={data.id}
          type="target"
          position={Position.Left}
          style={{
            height: PORT_HEIGHT,
            width: PORT_WIDTH,
            borderRadius: 100,
            border: "none",
          }}
        />
      )}
    </div>
  );
}
