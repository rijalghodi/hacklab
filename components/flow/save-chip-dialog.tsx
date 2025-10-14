"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edge, Node, useEdges, useNodes } from "@xyflow/react";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { HEX_COLOR_REGEX, VALID_HEX_CHARS } from "@/lib/constants/regex";
import { CircuitChip, Port, PortType, Wire } from "@/lib/types/chips";
import { generateId } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useChips } from "./flow-store";
import { useSaveChipDialogStore } from "./save-chip-dialog-store";

const formSchema = z.object({
  name: z.string().min(1, "Chip name is required").max(50, "Chip name must be less than 50 characters"),
  color: z.string().regex(HEX_COLOR_REGEX, "Invalid hex color format"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const DEFAULT_COLOR = "#854d0e";

export function SaveChipDialog() {
  const { addSavedChip, savedChips } = useChips();
  const { isOpen, closeDialog } = useSaveChipDialogStore();

  const nodes = useNodes<Node<CircuitChip>>();
  const edges = useEdges<Edge<Wire>>();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: DEFAULT_COLOR,
      description: "",
    },
  });

  console.log("nodes", nodes);
  console.log("edges", edges);

  const circuitData = useMemo(() => {
    const circuitChips = nodes
      .filter((node) => node.type === "chip")
      .map((node) => ({
        id: node.id,
        name: node.data.name,
      }));

    const circuitPorts: Port[] = nodes
      .filter((node) => node.type === "in" || node.type === "out")
      .map((node) => ({
        id: node.data.id,
        name: node.data.name,
        type: node.type === "in" ? PortType.IN : PortType.OUT,
      }));

    const circuitWires = edges.map((edge) => ({
      id: edge.id,
      sourceId: edge.data?.sourceId || "",
      targetId: edge.data?.targetId || "",
      sourcePortId: edge.data?.sourcePortId,
      targetPortId: edge.data?.targetPortId,
    }));

    return { circuitChips, circuitPorts, circuitWires };
  }, [nodes, edges]);

  const handleClose = useCallback(() => {
    closeDialog();
    form.reset();
  }, [closeDialog, form]);

  const onSubmit = useCallback(
    (formData: FormData) => {
      const newCircuit: CircuitChip = {
        id: generateId(),
        name: formData.name,
        color: formData.color,
        chips: circuitData.circuitChips,
        wires: circuitData.circuitWires,
        ports: circuitData.circuitPorts,
        definitions: [],
      };

      addSavedChip(newCircuit);
      handleClose();
    },
    [circuitData, addSavedChip, handleClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px] font-mono">
        <DialogHeader>
          <DialogTitle className="sr-only">Save Chip</DialogTitle>
          <DialogDescription className="sr-only">
            Save your current circuit as a reusable chip component.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chip Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter chip name"
                      {...field}
                      onChange={(e) => {
                        const name = e.target.value;
                        field.onChange(name);
                        const isDuplicateChip = savedChips.some((savedChip) => savedChip.name === name);
                        if (isDuplicateChip) {
                          form.setError("name", { message: "Chip name already taken" });
                          return;
                        } else {
                          form.clearErrors("name");
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        className="h-10 w-20 p-1"
                        value={field.value}
                        onChange={(e) => {
                          const color = e.target.value;
                          if (HEX_COLOR_REGEX.test(color)) {
                            field.onChange(color);
                          }
                        }}
                      />
                      <Input
                        placeholder={DEFAULT_COLOR}
                        {...field}
                        value={field.value}
                        maxLength={7}
                        onChange={(e) => {
                          const input = e.target.value;

                          if (!VALID_HEX_CHARS.test(input)) {
                            return;
                          }

                          let processedInput = input;
                          if (input.length > 0 && !input.startsWith("#")) {
                            processedInput = "#" + input;
                          }

                          if (HEX_COLOR_REGEX.test(processedInput) && input.length > processedInput.length) {
                            return;
                          }

                          if (processedInput.length > 7) {
                            return;
                          }

                          field.onChange(processedInput);
                        }}
                        pattern="^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
                        title="Must be a valid hex color code (e.g., #FF0000 or #F00)."
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="flex-1"
                disabled={!!form.formState.errors.name || !form.formState.isValid}
              >
                Save Chip
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
