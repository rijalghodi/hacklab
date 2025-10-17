"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edge, Node, useReactFlow } from "@xyflow/react";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { CircuitChip, NodeType, Wire } from "@/lib/types/chips";
import { useRenamePortDialogStore } from "@/hooks";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui";

const formSchema = z.object({
  name: z.string().min(1, "Port name is required").max(50, "Port name must be less than 50 characters"),
});

type FormData = z.infer<typeof formSchema>;

export function RenamePortDialog() {
  const { isOpen, nodeId, initialName, closeDialog } = useRenamePortDialogStore();
  const { getNode, updateNodeData } = useReactFlow<Node<CircuitChip>, Edge<Wire>>();

  const node = useMemo(() => (nodeId ? getNode(nodeId) : null), [getNode, nodeId]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialName,
    },
  });

  // Reset form when dialog opens or initialName changes
  useEffect(() => {
    if (isOpen) {
      form.reset({ name: initialName });
    }
  }, [isOpen, initialName, form]);

  const handleClose = () => {
    closeDialog();
    form.reset();
  };

  const onSubmit = (formData: FormData) => {
    if (!nodeId) return;
    if (!node?.data?.ports || node.data.ports.length === 0) return;

    // Prevent submission if there are form errors
    if (form.formState.errors.name) return;

    const updatedPorts = node.data.ports.map((port) => ({
      ...port,
      name: formData.name,
    }));

    updateNodeData(nodeId, {
      ...node.data,
      ports: updatedPorts,
      name: formData.name,
    });

    handleClose();
  };

  if (!node || (node.type !== NodeType.IN && node.type !== NodeType.OUT)) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[425px] font-mono" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="sr-only">Rename Port</DialogTitle>
          <DialogDescription className="sr-only">Enter a new name for this port.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter port name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" className="flex-1 uppercase" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="flex-1 uppercase"
                disabled={!!form.formState.errors.name || !form.formState.isValid}
              >
                Rename
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
