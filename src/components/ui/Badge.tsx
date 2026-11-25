import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-[var(--primary)] text-white [a&]:hover:bg-[var(--primary-hover)]",
        primary: "bg-[var(--primary)] text-white [a&]:hover:bg-[var(--primary-hover)]",
        secondary:
          "bg-[var(--surface-muted)] text-[var(--color-foreground)] border-[var(--border)] [a&]:hover:bg-[var(--surface-muted-strong)]",
        destructive:
          "bg-[var(--error)] text-white [a&]:hover:bg-[var(--error)]/90",
        error:
          "bg-[var(--error)] text-white [a&]:hover:bg-[var(--error)]/90",
        danger:
          "bg-[var(--error)] text-white [a&]:hover:bg-[var(--error)]/90",
        success:
          "bg-[var(--color-success)] text-white [a&]:hover:bg-[var(--color-success)]/90",
        warning:
          "bg-[var(--color-warning)] text-slate-950 [a&]:hover:bg-[var(--color-warning)]/90",
        info:
          "bg-[var(--color-info)] text-white [a&]:hover:bg-[var(--color-info)]/90",
        outline:
          "border-[var(--border)] text-[var(--color-foreground)] [a&]:hover:bg-[var(--surface-muted)]",
        ghost: "text-[var(--color-foreground)] [a&]:hover:bg-[var(--surface-muted)]",
        link: "text-[var(--primary)] underline-offset-4 [a&]:hover:underline",
      },
      size: {
        default: "",
        sm: "px-1.5 py-0 text-[10px]",
        md: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
export default Badge
