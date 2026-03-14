import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-2xl select-none shadow-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between pt-1 relative items-center px-2 mb-2",
        caption_label: "text-sm font-bold text-foreground font-display",
        nav: "space-x-1 flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white hover:bg-primary/10 hover:text-primary border-border rounded-xl p-0 opacity-100 transition-all shadow-sm active:scale-95"
        ),
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between mb-1",
        head_cell:
          "text-primary/60 rounded-md w-9 font-bold text-[0.7rem] uppercase tracking-widest",
        row: "flex w-full mt-1 justify-between",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative transition-transform hover:scale-105",
          "[&:has([aria-selected].day-range-end)]:rounded-r-full",
          "[&:has([aria-selected].day-outside)]:bg-primary/5",
          "[&:has([aria-selected])]:bg-primary/10",
          "first:[&:has([aria-selected])]:rounded-l-full",
          "last:[&:has([aria-selected])]:rounded-r-full",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium rounded-full hover:bg-primary/10 hover:text-primary transition-all aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white rounded-full font-bold shadow-lg shadow-primary/30 scale-105",
        day_today: "bg-primary/5 text-primary font-black rounded-full ring-2 ring-primary/20",
        day_outside:
          "day-outside text-muted-foreground opacity-30 aria-selected:bg-primary/5 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-20 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-primary/10 aria-selected:text-primary rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
