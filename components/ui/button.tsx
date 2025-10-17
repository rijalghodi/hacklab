import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  cn(
    "font-mono inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-semibold cursor-pointer",
    "disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0",
    "[&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20",
    "dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive duration-300 transition-all",
  ),
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground hover:bg-primary",
        gradient:
          "text-primary-foreground from-primary via-primary/60 to-primary bg-transparent bg-gradient-to-r [background-size:200%_auto] hover:bg-transparent hover:bg-[99%_center]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/80 dark:hover:bg-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-accent/50 dark:border-border dark:hover:bg-accent",
        accent:
          "border bg-accent dark:bg-accent/50 dark:hover:bg-primary text-accent-foreground shadow-xs hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-5 py-2 has-[>svg]:px-3.5 text-base",
        sm: "h-9 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-sm",
        lg: "h-11 rounded-md px-6 has-[>svg]:px-4 text-lg",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
