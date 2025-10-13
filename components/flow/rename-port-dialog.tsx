"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { CircuitChip, Wire } from "@/lib/types/chips";

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

import { useRenameDialogStore } from "./rename-dialog-store";

const formSchema = z.object({
  portName: z.string().min(1, "Port name is required").max(50, "Port name must be less than 50 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function RenamePortDialog() {
  const { isOpen, nodeId, initialName, closeDialog } = useRenameDialogStore();
  const { getNode, updateNodeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portName: initialName,
    },
  });

  // Reset form when dialog opens or initialName changes
  useEffect(() => {
    if (isOpen) {
      form.reset({ portName: initialName });
    }
  }, [isOpen, initialName, form]);

  const handleClose = useCallback(() => {
    closeDialog();
    form.reset();
  }, [closeDialog, form]);

  const onSubmit = useCallback(
    (data: FormData) => {
      if (nodeId) {
        handleRename(nodeId, data.portName);
      }
      handleClose();
    },
    [nodeId, handleClose],
  );

  const handleRename = useCallback(
    (nodeId: string, newName: string) => {
      const targetNode = getNode(nodeId);
      if (!targetNode?.data?.ports || targetNode.data.ports.length === 0) return;

      // Update the port name in the node data
      const updatedPorts = targetNode.data.ports.map((port) => ({
        ...port,
        name: newName,
      }));

      updateNodeData(nodeId, {
        ...targetNode.data,
        ports: updatedPorts,
        name: newName, // Also update the node name
      });
    },
    [updateNodeData],
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px] font-mono">
        <DialogHeader>
          <DialogTitle className="sr-only">Rename Port</DialogTitle>
          <DialogDescription className="sr-only">Enter a new name for this port.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="portName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">Port Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter port name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="outline" className="flex-1">
                Rename
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
