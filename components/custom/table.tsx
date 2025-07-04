"use client";
import { results } from "@/db/generated/prisma";
import { cn } from "@/lib/utils";
import { updateManyData } from "@/services/results";
import equal from "fast-deep-equal";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import SortModuleContext from "./sort-context";
import StatusDropdown from "./status-dropdown";
import CustomRow from "./table-row";

function TableDisplayPure({
  data = [],
  selectedRow = null,
  isAdmin = false,
}: {
  data?: results[];
  selectedRow?: number | null;
  isAdmin?: boolean;
}) {
  const dataMemo = useMemo(() => data, [data]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);

  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    if (expandedRows.length > 0) {
      setExpandedRows([]);

      const params = new URLSearchParams(searchParams.toString());

      replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
      return;
    }
    setExpandedRows(dataMemo.map((item) => item.id));
  };

  const handleSelected = (id: number, shiftKey: boolean) => {
    const idx = dataMemo.findIndex((x) => x.id === id);
    if (shiftKey && lastIndex !== null) {
      const [start, end] = [lastIndex, idx].sort((a, b) => a - b);
      const rangeIds = dataMemo.slice(start, end + 1).map((x) => x.id);
      setSelectedRows((prev) => Array.from(new Set([...prev, ...rangeIds])));
    } else {
      setSelectedRows((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    }
    setLastIndex(idx);
  };

  const handleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.length === dataMemo.length ? [] : dataMemo.map((item) => item.id)
    );
    setLastIndex(null);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
    setLastIndex(null);
  };

  const handleMultiStatusChange = async (newValue: string) => {
    const promise = updateManyData(selectedRows, { status: newValue });
    toast.promise(promise, {
      loading: `Updating ${selectedRows.length} task(s)…`,
      success: `Status updated to "${newValue}"`,
      error: "Failed to update status",
    });
  };

  useEffect(() => {
    if (!selectedRow) return;
    const params = new URLSearchParams(searchParams.toString());

    params.delete("select");
    replace(`${pathname}?${params.toString()}#${selectedRow}`, {
      scroll: false,
    });

    const element = document.getElementById(selectedRow.toString());
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setExpandedRows([selectedRow]);
  }, [selectedRow]);

  return (
    <>
      <div className="w-full flex justify-between">
        <div className="flex gap-2">
          <Button variant={"outline"} onClick={handleExpandAll}>
            {expandedRows.length > 0 ? "Collapse All" : "Expand All"}
          </Button>
          {isAdmin && <SortModuleContext />}
        </div>
        {selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant={"outline"} onClick={handleDeselectAll}>
              {selectedRows.length} {selectedRows.length > 1 ? "Tasks" : "Task"}{" "}
              selected <X />
            </Button>
            <StatusDropdown onValueChange={handleMultiStatusChange} />
          </div>
        )}
      </div>
      <Table
        className={cn(
          "max-w-[1000px] mx-auto table-fixed w-full",
          !isAdmin && "table-auto"
        )}
      >
        <TableHeader className="select-none">
          <TableRow className="[&>th]:text-foreground/60 [&>th]:overflow-hidden">
            {isAdmin && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedRows.length === data.length && data.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead className="min-w-[120px]">Date</TableHead>
            {isAdmin && <TableHead className="w-[120px]">Invoice ID</TableHead>}
            {isAdmin && <TableHead className="w-[35%]">NAS Location</TableHead>}
            <TableHead className={cn("min-w-[120px]")}>Total</TableHead>
            <TableHead className="min-w-[120px]">Status</TableHead>
            {isAdmin && (
              <TableHead className="text-center w-[120px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataMemo.length > 0 &&
            dataMemo.map((item) => {
              return (
                <CustomRow
                  key={item.id}
                  data={item}
                  isExpanded={expandedRows.includes(item.id)}
                  onExpand={handleExpand}
                  isSelected={selectedRows.includes(item.id)}
                  onSelected={handleSelected}
                  isAdmin={isAdmin}
                />
              );
            })}
          {dataMemo.length === 0 && (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 3} className="text-center py-8">
                No Data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

export const TableDisplay = memo(TableDisplayPure, (prevProps, nextProps) => {
  if (!equal(prevProps, nextProps)) return false;
  return true;
});
