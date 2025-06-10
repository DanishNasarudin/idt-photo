"use client";
import { cn } from "@/lib/utils";
import { Target } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { defaultColor } from "./cell-dropdown";

type Props = {
  onValueChange?: (newValue: string) => void;
};

export default function StatusDropdown({ onValueChange = () => {} }: Props) {
  const handleChange = (newValue: string) => {
    onValueChange(newValue);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"}>
          <Target /> Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuRadioGroup onValueChange={handleChange}>
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
