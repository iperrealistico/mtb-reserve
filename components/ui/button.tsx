import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { Loader2, Check, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { useSound } from "@/lib/sound"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 shadow-sm",
        outline:
          "border bg-background shadow-sm hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm border border-input",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
        "admin-huge": "h-32 text-xl font-bold flex flex-col items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-primary hover:text-primary transition-all shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-12 px-6 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-14 px-8 has-[>svg]:px-4 text-lg",
        icon: "size-10",
        "admin-huge": "w-full rounded-2xl",
      },
      rounded: {
        default: "rounded-xl",
        full: "rounded-full",
        md: "rounded-md"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default"
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  isSuccess?: boolean
  isError?: boolean
}

function Button({
  className,
  variant,
  size,
  rounded,
  asChild = false,
  isLoading = false,
  isSuccess = false,
  isError = false,
  children,
  disabled,
  onClick,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const { play } = useSound()

  // Dynamic variant override for states
  const activeVariant = isSuccess ? "success" : isError ? "destructive" : variant

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      play('click')
    }
    onClick?.(e)
  }

  return (
    <Comp
      data-slot="button"
      data-variant={activeVariant}
      data-size={size}
      disabled={isLoading || disabled}
      onClick={handleClick}
      className={cn(buttonVariants({ variant: activeVariant, size, rounded, className }), {
        "animate-shake": isError
      })}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          {children}
        </>
      ) : isSuccess ? (
        <>
          <Check className="animate-in zoom-in duration-300" />
          <span className="animate-in fade-in duration-300">Success</span>
        </>
      ) : isError ? (
        <>
          <AlertCircle className="animate-in zoom-in duration-300" />
          <span className="animate-in fade-in duration-300">Error</span>
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { Button, buttonVariants }
