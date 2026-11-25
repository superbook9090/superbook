import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all outline-none cursor-pointer focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-[var(--error)] aria-invalid:ring-[var(--error)]/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white shadow-xs hover:bg-[var(--primary-hover)] active:scale-[0.98]",
        primary:
          "bg-[var(--primary)] text-white shadow-xs hover:bg-[var(--primary-hover)] active:scale-[0.98]",
        destructive:
          "bg-[var(--error)] text-white shadow-xs hover:bg-[var(--error)]/90 focus-visible:ring-[var(--error)]/30 active:scale-[0.98]",
        error:
          "bg-[var(--error)] text-white shadow-xs hover:bg-[var(--error)]/90 focus-visible:ring-[var(--error)]/30 active:scale-[0.98]",
        danger:
          "bg-[var(--error)] text-white shadow-xs hover:bg-[var(--error)]/90 focus-visible:ring-[var(--error)]/30 active:scale-[0.98]",
        success:
          "bg-[var(--color-success)] text-white shadow-xs hover:bg-[var(--color-success)]/90 focus-visible:ring-[var(--color-success)]/30 active:scale-[0.98]",
        warning:
          "bg-[var(--color-warning)] text-slate-950 shadow-xs hover:bg-[var(--color-warning)]/90 focus-visible:ring-[var(--color-warning)]/30 active:scale-[0.98]",
        info:
          "bg-[var(--color-info)] text-white shadow-xs hover:bg-[var(--color-info)]/90 focus-visible:ring-[var(--color-info)]/30 active:scale-[0.98]",
        outline:
          "border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-xs hover:bg-[var(--surface-muted)]",
        secondary:
          "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--surface-muted-strong)]",
        ghost:
          "text-[var(--color-foreground)] hover:bg-[var(--surface-muted)]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        md: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    isLoading?: boolean
    fullWidth?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }), fullWidth && "w-full")}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
export default Button
