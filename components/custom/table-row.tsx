"use client";
import { results } from "@/db/generated/prisma";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";
import { useState } from "react";
import { useCopyToClipboard } from "usehooks-ts";
import { Accordion, AccordionContent, AccordionItem } from "../ui/accordion";
import { Button } from "../ui/button";
import { TableCell, TableRow } from "../ui/table";

type Props = {
  data: results;
};

export default function CustomRow({ data }: Props) {
  const [expand, setExpand] = useState("");
  const [_, copy] = useCopyToClipboard();

  return (
    <>
      <TableRow
        onClick={() => (expand === "" ? setExpand("item") : setExpand(""))}
      >
        <TableCell>{data.created_at.toISOString()}</TableCell>
        <TableCell>{data.invNumber}</TableCell>
        <TableCell>{data.nasLocation}</TableCell>
        <TableCell>{data.total}</TableCell>
        <TableCell>{data.status}</TableCell>
        <TableCell>actions</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} className="p-0">
          <Accordion type="single" value={expand} onValueChange={setExpand}>
            <AccordionItem value="item">
              <AccordionContent className=" p-2">
                <div
                  key={data.invNumber}
                  id={data.invNumber || "null"}
                  className="flex flex-col gap-2"
                >
                  <div className="flex flex-col gap-0">
                    <div className="flex gap-2 items-center">
                      <p className="text-primary font-bold">{data.invNumber}</p>
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
                  <div className="border-border border-[1px] rounded-lg flex gap-8 p-4">
                    <div className="flex w-full overflow-x-auto text-foreground/60 text-xs">
                      <pre>{data.originalContent}</pre>
                    </div>
                    <div
                      className={cn(
                        "flex w-full justify-center items-center rounded-lg",
                        !data.imagePath && "bg-destructive/5"
                      )}
                    >
                      {data.imagePath ? (
                        <img
                          src={data.imagePath}
                          alt={data.imagePath}
                          className="w-full h-auto object-cover rounded-lg"
                          draggable={false}
                        />
                      ) : (
                        <p className="text-destructive text-xs">
                          Missing Image
                        </p>
                      )}
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
