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
  Ready: "bg-zinc-700",
  Scheduled: "bg-purple-900",
  Posted: "bg-green-900",
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
            className="border-border border-[1px] bg-zinc-700  mb-1.5 cursor-pointer"
          >
            Ready
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="Scheduled"
            indicator={false}
            className="border-border border-[1px] bg-purple-900 hover:!bg-purple-700 mb-1.5 cursor-pointer"
          >
            Scheduled
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="Posted"
            indicator={false}
            className="border-border border-[1px] bg-green-900 hover:!bg-green-700 cursor-pointer"
          >
            Posted
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
