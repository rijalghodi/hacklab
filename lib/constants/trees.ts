import { CircuitTreeNode, CircuitTreeNodeType } from "@/lib/types";

const nandTree: CircuitTreeNode[] = [
  {
    id: "nand.port-out",
    type: CircuitTreeNodeType.PORT,
    sources: [
      {
        id: "nand",
        type: CircuitTreeNodeType.NAND_CHIP,
        sources: [
          {
            id: "nand.port-a",
            type: CircuitTreeNodeType.PORT,
            sources: [],
          },
          {
            id: "nand.port-b",
            type: CircuitTreeNodeType.PORT,
            sources: [],
          },
        ],
      },
    ],
  },
];

const nandTree2: CircuitTreeNode[] = [
  {
    id: "out",
    type: CircuitTreeNodeType.PORT,
    sources: [
      // Wires/base chips that connect to this out port
      {
        id: "wire-3",
        type: CircuitTreeNodeType.WIRE,
        sources: [
          // output ports that connect to the wire
          {
            id: "nand.port-out",
            type: CircuitTreeNodeType.PORT,
            sources: [
              // wires/base chips that connect to the output port
              {
                id: "nand",
                type: CircuitTreeNodeType.NAND_CHIP,
                sources: [
                  // input ports that connect to the base chip
                  {
                    id: "nand.port-a",
                    type: CircuitTreeNodeType.PORT,
                    sources: [
                      // wires that connect to the input port
                      {
                        id: "wire-1",
                        type: CircuitTreeNodeType.WIRE,
                        sources: [
                          // input ports that connect to the wire
                          {
                            id: "a",
                            type: CircuitTreeNodeType.PORT,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    id: "nand.port-b",
                    type: CircuitTreeNodeType.PORT,
                    sources: [
                      // wires that connect to the input port
                      {
                        id: "wire-2",
                        type: CircuitTreeNodeType.WIRE,
                        sources: [
                          // input ports that connect to the wire
                          {
                            id: "b",
                            type: CircuitTreeNodeType.PORT,
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
    ],
  },
];

const notTree: CircuitTreeNode[] = [
  {
    id: "9861akqh",
    type: CircuitTreeNodeType.PORT,
    sources: [
      // Wire that connects the NAND output to the NOT output port
      {
        id: "jm77jips",
        type: CircuitTreeNodeType.WIRE,
        sources: [
          {
            id: "35iark5p",
            type: CircuitTreeNodeType.NAND_CHIP,
            sources: [
              // NAND input port A
              {
                id: "nand.port-a",
                type: CircuitTreeNodeType.PORT,
                sources: [
                  // Wire connecting input to NAND port A
                  {
                    id: "zk2c96ev",
                    type: CircuitTreeNodeType.WIRE,
                    sources: [
                      // Input port
                      {
                        id: "ysv3o6cg",
                        type: CircuitTreeNodeType.PORT,
                      },
                    ],
                  },
                ],
              },
              // NAND input port B
              {
                id: "nand.port-b",
                type: CircuitTreeNodeType.PORT,
                sources: [
                  // Wire connecting input to NAND port B (same input as port A)
                  {
                    id: "yjqpg01u",
                    type: CircuitTreeNodeType.WIRE,
                    sources: [
                      // Input port (same as port A)
                      {
                        id: "ysv3o6cg",
                        type: CircuitTreeNodeType.PORT,
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

const andTree: CircuitTreeNode[] = [
  {
    id: "eoqc0cw1",
    type: CircuitTreeNodeType.PORT,
    sources: [
      // Wire connecting NOT output to AND output port
      {
        id: "7b98ixi8",
        type: CircuitTreeNodeType.WIRE,
        sources: [
          // NOT chip output port (replaced with notTree structure)
          notTree[0],
          // {
          //   id: "9861akqh",
          //   type: CircuitTreeItemType.PORT,
          //   sources: [
          //     // Wire connecting AND's NAND output to NOT input
          //     {
          //       id: "j83ipyxz",
          //       type: CircuitTreeItemType.WIRE,
          //       sources: [
          //         // AND's NAND output port
          //         {
          //           id: "nand.port-out",
          //           type: CircuitTreeItemType.PORT,
          //           sources: [
          //             // AND's NAND chip
          //             {
          //               id: "bu0sn94u",
          //               type: CircuitTreeItemType.NAND_CHIP,
          //               sources: [
          //                 // NAND input port A
          //                 {
          //                   id: "nand.port-a",
          //                   type: CircuitTreeItemType.PORT,
          //                   sources: [
          //                     // Wire connecting first input to NAND port A
          //                     {
          //                       id: "3rpmjn4x",
          //                       type: CircuitTreeItemType.WIRE,
          //                       sources: [
          //                         // First input port
          //                         {
          //                           id: "xqz6exxl",
          //                           type: CircuitTreeItemType.PORT,
          //                         },
          //                       ],
          //                     },
          //                   ],
          //                 },
          //                 // NAND input port B
          //                 {
          //                   id: "nand.port-b",
          //                   type: CircuitTreeItemType.PORT,
          //                   sources: [
          //                     // Wire connecting second input to NAND port B
          //                     {
          //                       id: "pyjyzaal",
          //                       type: CircuitTreeItemType.WIRE,
          //                       sources: [
          //                         // Second input port
          //                         {
          //                           id: "23xwycvx",
          //                           type: CircuitTreeItemType.PORT,
          //                         },
          //                       ],
          //                     },
          //                   ],
          //                 },
          //               ],
          //             },
          //           ],
          //         },
          //       ],
          //     },
          //   ],
          // },
        ],
      },
    ],
  },
];

export { andTree, nandTree, notTree, nandTree2 };
