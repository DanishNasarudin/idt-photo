import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export type Status = "Ready" | "Scheduled" | "Posted";

export const defaultColor: Record<Status, string> = {
  Ready:
    "bg-zinc-500 dark:bg-zinc-700 hover:dark:!bg-zinc-500 hover:!bg-zinc-400 !text-white",
  Scheduled:
    "bg-purple-500 dark:bg-purple-900 hover:dark:!bg-purple-700 hover:!bg-purple-400 !text-white",
  Posted:
    "bg-green-500 dark:bg-green-900 hover:dark:!bg-green-700 hover:!bg-green-400 !text-white",
};

type Props = {
  value?: string;
  onValueChange?: (newValue: string) => void;
  className?: string;
};

export default function CellDropdown({
  value = "",
  onValueChange = () => {},
  className,
}: Props) {
  const [selected, setSelected] = useState<Status>((value as any) || "");

  const handleChange = (newValue: string) => {
    setSelected(newValue as Status);
    onValueChange(newValue);
  };

  useEffect(() => {
    if (selected !== value) {
      setSelected(value as any);
    }
  }, [value]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "w-full h-full py-0.5 px-2 border-border border-[1px] rounded-md",
            defaultColor[selected],
            className
          )}
        >
          {selected}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuRadioGroup value={selected} onValueChange={handleChange}>
          <DropdownMenuRadioItem
            value="Ready"
            indicator={false}
            className={cn(
              "border-border border-[1px]  mb-1.5 cursor-pointer",
              defaultColor["Ready"]
            )}
          >
            Ready
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="Scheduled"
            indicator={false}
            className={cn(
              "border-border border-[1px] mb-1.5 cursor-pointer",
              defaultColor["Scheduled"]
            )}
          >
            Scheduled
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="Posted"
            indicator={false}
            className={cn(
              "border-border border-[1px] bg-green-900 hover:!bg-green-700 cursor-pointer",
              defaultColor["Posted"]
            )}
          >
            Posted
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
