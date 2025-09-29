import { Edge, Handle, type Node, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";

import { builtInChips, builtInPorts } from "@/lib/constants/chips";
import {
  PortType,
  StatefulChip,
  StatefulCircuitModule,
  StatefulCircuitPort,
  StatefulPort,
  StatefulWire,
} from "@/lib/types/flow";
import { cn, getActiveColor, getBgColor, getBorderColor } from "@/lib/utils";

import { useSavedChips } from "./flow-store";

const PORT_HEIGHT = 7;
const PORT_WIDTH = 7;

export function PortNode(props: NodeProps<Node<StatefulPort>>) {
  const { id, data, selected } = props;
  const { savedChips } = useSavedChips();
  const { updateNodeData, getEdges, getNodes, getNode, getEdge } = useReactFlow<
    Node<StatefulChip | StatefulPort>,
    Edge<StatefulWire>
  >();

  const portName = data.name;
  const portState = data.value;
  const currentPort = builtInPorts.find((port) => port.name === portName);

  // handle click on port
  const handleClick = (e: React.MouseEvent<SVGCircleElement>) => {
    e.stopPropagation();
    propagatePortValues(data.id, !portState);
  };

  const propagatePortValues = (portId: string, portValue: boolean) => {
    // update port value
    updateNodeData(portId, { value: portValue });

    const currentEdges = getEdges().filter((e) => e.source === portId);

    if (currentEdges.length === 0) {
      return;
    }

    for (const edge of currentEdges) {
      const currentNode = getNode(edge?.target);

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
        updateNodeData(selectedPort.id, { value: portValue });
      }

      const inputPortValues = ports.map((port) => ({ id: port.id, value: port.value as boolean }));

      // update output port
      const outputChipValues = computeOutputChip(data.id, inputPortValues);

      if (outputChipValues) {
        for (const outputPort of outputChipValues) {
          updateNodeData(outputPort.id, { value: outputPort.value });
          propagatePortValues(outputPort.id, outputPort.value);
        }
      }
    }
  };

  type IdValue = { id: string; value: boolean };

  const computeOutputChip = (chipId: string, inputValues: IdValue[]): IdValue[] | null => {
    const currentChip = getNode(chipId) as Node<StatefulChip>;

    if (!currentChip || currentChip.type !== "chip") {
      return null;
    }

    const inputPorts = currentChip.data.ports?.filter((port) => port.type === PortType.IN);
    const outputPorts = currentChip.data.ports?.filter((port) => port.type === PortType.OUT);

    if (!outputPorts || outputPorts.length === 0 || !inputPorts || inputPorts.length === 0) {
      return null;
    }

    const allChips = [...builtInChips, ...savedChips];
    const statefulChip = allChips.find((c) => c.name === currentChip.data.name) as StatefulCircuitModule;

    if (!statefulChip) {
      return null;
    }

    if (!statefulChip.ports) {
      return null;
    }

    // copy input ports
    // for (let i = 0; i < statefulChip.ports.length; i++) {
    //   statefulChip.ports[i].value = inputValues[i].value;
    // }

    for (const internalPort of statefulChip.ports) {
      if (internalPort.type === PortType.OUT) continue;

      const inputPortValue = inputValues.find((port) => port.id === internalPort.id);
      if (inputPortValue) {
        internalPort.value = inputPortValue.value;
      }
    }

    // internal ports
    const internalPorts = statefulChip.ports;
    if (!internalPorts) {
      return null;
    }

    const internalInputPorts = internalPorts.filter((port) => port.type === PortType.IN);
    if (!internalInputPorts || internalInputPorts.length === 0) {
      return null;
    }

    for (const internalInputPort of internalInputPorts) {
      // const inputPortValue = inputPortValues.find((port) => port.id === internalInputPort.id);
      // if (inputPortValue) {
      // }
    }

    // Copy input ports to internal input ports
    // for (let i = 0; i < internalInputPorts.length; i++) {
    //   const inputPort = inputPorts[i];
    //   if (inputPort) {
    //     internalInputPorts[i].value = inputPort.value;
    //   }
    // }

    // Internal chips
    // const internalChips = statefulChip.chips;

    // if (!internalChips || internalChips.length === 0) {
    //   return null;
    // }

    // Do nested recursive actions
    for (const internalChip of statefulChip.chips) {
      if (internalChip.name == "NAND") {
        let outputValue: boolean | undefined;
        for (const inputPortValue of inputPortValues) {
          outputValue = outputValue && inputPortValue.value;
        }
      } else {
        computeOutputChip(internalChip.id, inputPortValues);
      }
    }

    // copy internal output ports to chip output ports
    // for (let i = 0; i < outputPorts.length; i++) {
    //   outputPorts[i].value = outputValue as boolean;
    // }

    return null;
  };

  return (
    <div className={cn("relative font-mono rounded-sm", selected && "outline-ring outline-1")}>
      {portName === PortType.IN && (
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

      {portName === PortType.OUT && (
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
      {portName === PortType.IN && (
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
      {portName === PortType.OUT && (
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
