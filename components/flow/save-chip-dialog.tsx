"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edge, Node, useEdges, useNodes } from "@xyflow/react";
import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { HEX_COLOR_REGEX, VALID_HEX_CHARS } from "@/lib/constants/regex";
import { flowToCircuit } from "@/lib/flow-utils";
import { CircuitChip, Wire } from "@/lib/types/chips";
import { generateId } from "@/lib/utils";
import { useSaveChipDialogStore } from "@/hooks/save-chip-dialog-store";
import { useChips } from "@/hooks/use-chips-store";
import { useCircuitPageParams } from "@/hooks/use-circuit-page-params";

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

const formSchema = z.object({
  name: z.string().min(1, "Chip name is required").max(50, "Chip name must be less than 50 characters"),
  color: z.string().regex(HEX_COLOR_REGEX, "Invalid hex color format"),
});

type FormData = z.infer<typeof formSchema>;

const DEFAULT_COLOR = "#854d0e";

export function SaveChipDialog() {
  const { chipId, navigateToChipIdNoConfirm: setChipIdWithoutConfirmation } = useCircuitPageParams();
  const { addSavedChip, getAllChips, getChipById, updateSavedChip } = useChips();
  const allChips = getAllChips();
  const { isOpen, closeDialog } = useSaveChipDialogStore();

  const initialChip = chipId ? getChipById(chipId) : null;

  const nodes = useNodes<Node<CircuitChip>>();
  const edges = useEdges<Edge<Wire>>();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: DEFAULT_COLOR,
    },
  });

  useEffect(() => {
    if (initialChip) {
      form.setValue("name", initialChip.name);
      if (initialChip.color) {
        form.setValue("color", initialChip.color);
      }
    }
  }, [initialChip, form]);

  const handleClose = () => {
    closeDialog();
    form.reset();
  };

  const onSubmit = useCallback(
    (formData: FormData) => {
      try {
        const newCircuit = flowToCircuit(nodes, edges);

        if (initialChip) {
          updateSavedChip(initialChip.id, {
            ...newCircuit,
            id: initialChip.id,
            name: formData.name,
            color: formData.color,
          });
        } else {
          const newChipId = generateId();
          addSavedChip({
            ...newCircuit,
            id: newChipId,
            name: formData.name,
            color: formData.color,
          });

          setChipIdWithoutConfirmation(newChipId);
        }
        handleClose();
        toast.success("Chip saved");
      } catch (error) {
        console.error(error);
        toast.error("Failed to save chip");
      }
    },
    [nodes, edges, handleClose, initialChip, updateSavedChip, addSavedChip, setChipIdWithoutConfirmation],
  );

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="sm:max-w-[500px] font-mono" showCloseButton={false}>
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
                        const isDuplicateChip = allChips.some((chip) => chip.name === name);
                        console.log("isDuplicateChip", isDuplicateChip);
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

            <DialogFooter className="mt-6">
              <Button type="button" variant="accent" className="flex-1 uppercase" onClick={handleClose}>
                Cancel
              </Button>
              {/* <Button type="button" variant="accent" className="flex-1 uppercase" onClick={handleClose}>
                Customize
              </Button> */}
              <Button
                type="submit"
                variant="accent"
                className="flex-1 uppercase"
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
