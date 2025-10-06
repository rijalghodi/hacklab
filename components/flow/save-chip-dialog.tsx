"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Circuit, NodeType } from "@/lib/types/flow";

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

import { useChips, useFlowStore } from "./flow-store";

const formSchema = z.object({
  name: z.string().min(1, "Chip name is required").max(50, "Chip name must be less than 50 characters"),
  color: z.string().min(1, "Color is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SaveChipDialogProps {
  children: React.ReactNode;
}

export function SaveChipDialog({ children }: SaveChipDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { nodes, edges } = useFlowStore();
  const { savedChips, setSavedChips } = useChips();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#854d0e",
      description: "",
    },
  });

  const onSubmit = (data: FormData) => {
    // Convert current flow nodes and edges to a Circuit
    const circuitNodes = nodes.map((node) => ({
      id: node.id,
      type: node.data.type,
      name: node.data.name,
      color: node.data.color,
      position: node.position,
    }));

    const circuitEdges = edges.map((edge) => ({
      id: edge.id,
      sourceId: edge.data?.sourceId || "",
      targetId: edge.data?.targetId || "",
      sourcePortId: edge.data?.sourcePortId,
      targetPortId: edge.data?.targetPortId,
      color: edge.data?.color,
    }));

    const newCircuit: Circuit = {
      type: NodeType.CHIP,
      name: data.name,
      color: data.color,
      description: data.description,
      nodes: circuitNodes,
      edges: circuitEdges,
      version: "1.0",
      createdAt: new Date().toISOString(),
      createdBy: "user",
    };

    // Add to saved chips
    const updatedChips = [...savedChips, newCircuit];
    setSavedChips(updatedChips);

    // Reset form and close dialog
    form.reset();
    setOpen(false);
  };

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
                      <Input placeholder="#854d0e" {...field} />
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
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter chip description (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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
