"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { CircuitChip, Port, PortType } from "@/lib/types/chips";
import { generateId } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { useChips, useFlowStore } from "./flow-store";

const formSchema = z.object({
  name: z.string().min(1, "Chip name is required").max(50, "Chip name must be less than 50 characters"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color format"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SaveChipDialogProps {
  children: React.ReactNode;
}

const DEFAULT_COLOR = "#854d0e";

export function SaveChipDialog({ children }: SaveChipDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { nodes, edges } = useFlowStore();
  const { savedChips, setSavedChips } = useChips();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: DEFAULT_COLOR,
      description: "",
    },
  });

  // Memoize circuit data extraction to avoid recalculation on every render
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
    setOpen(false);
    form.reset();
  }, [form]);

  const onSubmit = useCallback(
    (data: FormData) => {
      const newCircuit: CircuitChip = {
        id: generateId(),
        name: data.name,
        color: data.color,
        chips: circuitData.circuitChips,
        wires: circuitData.circuitWires,
        ports: circuitData.circuitPorts,
        definitions: [],
      };

      setSavedChips([...savedChips, newCircuit]);
      handleClose();
    },
    [circuitData, savedChips, setSavedChips, handleClose],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Chip</DialogTitle>
          <DialogDescription>Save your current circuit as a reusable chip component.</DialogDescription>
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
                    <Input placeholder="Enter chip name" {...field} />
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
                      <Input type="color" className="h-10 w-20 p-1" {...field} />
                      <Input placeholder={DEFAULT_COLOR} {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter chip description (optional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">Save Chip</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
