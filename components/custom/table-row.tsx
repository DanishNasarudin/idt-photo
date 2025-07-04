"use client";
import { results } from "@/db/generated/prisma";
import { cn, formatDate } from "@/lib/utils";
import { updateData } from "@/services/results";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { TableCell, TableRow } from "../ui/table";
import CellActions from "./cell-actions";
import CellCopy from "./cell-copy";
import CellDropdown from "./cell-dropdown";
import { SmartImage } from "./smart-image";

type Props = {
  data: results;
  isExpanded?: boolean;
  onExpand?: (newValue: number) => void;
  isSelected?: boolean;
  onSelected?: (newValue: number, shiftKey: boolean) => void;
  isAdmin?: boolean;
};

export default function CustomRow({
  data,
  isExpanded = false,
  onExpand = () => {},
  isSelected = false,
  onSelected = () => {},
  isAdmin = false,
}: Props) {
  const [expand, setExpand] = useState("");
  const [selected, setSelected] = useState(false);
  const [_, copy] = useCopyToClipboard();

  const handleValueChange = async (newValue: string) => {
    toast.promise(updateData(data.id, { status: newValue }), {
      loading: "Updating data..",
      success: "Updated!",
      error: "Data update failed!",
    });
  };

  const handleExpand = () => {
    if (expand === "") {
      setExpand("item");
      onExpand(data.id);
    } else {
      setExpand("");
      onExpand(data.id);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      setExpand("item");
    } else {
      setExpand("");
    }
  }, [isExpanded]);

  useEffect(() => {
    if (isSelected) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [isSelected]);

  return (
    <>
      <TableRow
        id={`${data.id}`}
        onClick={handleExpand}
        className="cursor-pointer select-none [&>td]:overflow-hidden"
      >
        {isAdmin && (
          <TableCell>
            <Checkbox
              checked={selected}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onSelected(data.id, e.shiftKey);
              }}
            />
          </TableCell>
        )}
        <TableCell>
          <CellCopy name="Date" value={formatDate(data.created_at) || ""} />
        </TableCell>
        {isAdmin && (
          <TableCell>
            <CellCopy name="Invoice ID" value={data.invNumber || ""} />
          </TableCell>
        )}
        {isAdmin && (
          <TableCell>
            <CellCopy name="NAS Location" value={data.nasLocation || ""} />
          </TableCell>
        )}
        <TableCell>{data.total}</TableCell>
        <TableCell className={cn("py-0")}>
          <CellDropdown
            value={data.status || ""}
            onValueChange={handleValueChange}
            className={cn(!isAdmin && "pointer-events-none")}
          />
        </TableCell>
        {isAdmin && (
          <TableCell className="py-0">
            <CellActions id={data.id} />
          </TableCell>
        )}
      </TableRow>
      <TableRow className="border-0">
        <TableCell colSpan={isAdmin ? 7 : 4} className="p-0">
          <Accordion type="single" value={expand} onValueChange={setExpand}>
            <AccordionItem value="item">
              <AccordionContent
                className="p-2"
                key={data.invNumber}
                id={data.invNumber || "null"}
              >
                <div className="hidden sm:flex flex-col gap-2">
                  {isAdmin && (
                    <div className="flex flex-col gap-0">
                      <div className="flex gap-2 items-center">
                        <p className="text-primary font-bold">
                          {data.invNumber}
                        </p>
                        <Button
                          variant={"ghost"}
                          size={"icon"}
                          onClick={() => copy(data.invNumber || "null")}
                          className="w-8 h-8 text-foreground/60"
                        >
                          <Copy />
                        </Button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <p>{data.nasLocation}</p>
                        <Button
                          variant={"ghost"}
                          size={"icon"}
                          onClick={() => copy(data.nasLocation || "null")}
                          className="w-8 h-8 text-foreground/60"
                        >
                          <Copy />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="border-border border-[1px] rounded-lg flex gap-8 p-4">
                    <div className="flex w-full overflow-x-auto text-foreground/60 text-xs relative group">
                      <pre>{data.originalContent}</pre>
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        className="absolute hidden group-hover:flex h-8 w-8 top-0 right-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copy(data.originalContent || "");
                          toast.success(`Specs copied!`);
                        }}
                      >
                        <Copy />
                      </Button>
                    </div>
                    <div
                      className={cn(
                        "flex w-full justify-center items-center rounded-lg",
                        !data.imagePath && "bg-destructive/5"
                      )}
                    >
                      <div
                        data-state={expand === "item" ? "open" : "closed"}
                        className="w-full"
                      >
                        {expand === "item" && data.imagePath ? (
                          <SmartImage
                            data-loaded="false"
                            onLoad={(e) =>
                              e.currentTarget.setAttribute(
                                "data-loaded",
                                "true"
                              )
                            }
                            src={`/api${data.imagePath}`}
                            alt={data.imagePath}
                            width={459}
                            height={306}
                            className="data-[loaded=false]:bg-foreground/30 data-[loaded=false]:animate-pulse w-full h-auto object-cover rounded-lg"
                            draggable={false}
                          />
                        ) : (
                          !data.imagePath && (
                            <p className="text-destructive text-xs">
                              Missing Image
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex sm:hidden flex-col gap-2">
                  {isAdmin && (
                    <div className="flex flex-col gap-0">
                      <div className="flex gap-2 items-center">
                        <p className="text-primary font-bold">
                          {data.invNumber}
                        </p>
                        <Button
                          variant={"ghost"}
                          size={"icon"}
                          onClick={() => copy(data.invNumber || "null")}
                          className="w-8 h-8 text-foreground/60"
                        >
                          <Copy />
                        </Button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <p>{data.nasLocation}</p>
                        <Button
                          variant={"ghost"}
                          size={"icon"}
                          onClick={() => copy(data.nasLocation || "null")}
                          className="w-8 h-8 text-foreground/60"
                        >
                          <Copy />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="border-border border-[1px] rounded-lg flex flex-col-reverse gap-8 p-4">
                    <div className="flex w-full overflow-x-auto text-foreground/60 text-xs relative group">
                      <pre>{data.originalContent}</pre>
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        className="absolute hidden group-hover:flex h-8 w-8 top-0 right-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copy(data.originalContent || "");
                          toast.success(`Specs copied!`);
                        }}
                      >
                        <Copy />
                      </Button>
                    </div>
                    <div
                      className={cn(
                        "flex w-full justify-center items-center rounded-lg",
                        !data.imagePath && "bg-destructive/5"
                      )}
                    >
                      <div
                        data-state={expand === "item" ? "open" : "closed"}
                        className="w-full"
                      >
                        {expand === "item" && data.imagePath ? (
                          <SmartImage
                            data-loaded="false"
                            onLoad={(e) =>
                              e.currentTarget.setAttribute(
                                "data-loaded",
                                "true"
                              )
                            }
                            src={`/api${data.imagePath}`}
                            alt={data.imagePath}
                            width={459}
                            height={306}
                            className="data-[loaded=false]:bg-foreground/30 data-[loaded=false]:animate-pulse w-full h-auto object-cover rounded-lg"
                            draggable={false}
                          />
                        ) : (
                          !data.imagePath && (
                            <p className="text-destructive text-xs">
                              Missing Image
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </TableCell>
      </TableRow>
    </>
  );
}
