import { CircuitSource, NodeType } from "../types/flow";

export const NAND_SOURCES: CircuitSource[] = [
  {
    portName: "out",
    nodes: [
      {
        name: "NAND",
        type: NodeType.CHIP,
        sources: [
          {
            portName: "a",
            nodes: [
              {
                name: "IN",
                type: NodeType.IN,
              },
            ],
          },
          {
            portName: "b",
            nodes: [
              {
                name: "IN",
                type: NodeType.IN,
              },
            ],
          },
        ],
      },
    ],
  },
];

export const NOT_SOURCES: CircuitSource[] = [
  {
    portName: "out",
    nodes: [
      {
        name: "NAND",
        type: NodeType.CHIP,
        sources: [
          {
            portName: "a",
            nodes: [
              {
                name: "IN",
                type: NodeType.IN,
                sources: [
                  {
                    portName: "in",
                    nodes: [
                      {
                        name: "IN",
                        type: NodeType.IN,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            portName: "b",
            nodes: [
              {
                name: "IN",
                type: NodeType.IN,
                sources: [
                  {
                    portName: "in",
                    nodes: [
                      {
                        name: "IN",
                        type: NodeType.IN,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
