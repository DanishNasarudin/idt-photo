"use client";
import { results } from "@/db/generated/prisma";
import { updateManyData } from "@/services/results";
import { X } from "lucide-react";
import { useMemo, useState } from "react";
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
import StatusDropdown from "./status-dropdown";
import CustomRow from "./table-row";

export default function TableDisplay({ data = [] }: { data?: results[] }) {
  const dataMemo = useMemo(() => data, [data]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [lastIndex, setLastIndex] = useState<number | null>(null);

  const handleExpand = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    if (expandedRows.length > 0) {
      setExpandedRows([]);
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

  return (
    <>
      <div className="w-full flex justify-between">
        <Button variant={"outline"} onClick={handleExpandAll}>
          {expandedRows.length > 0 ? "Collapse All" : "Expand All"}
        </Button>
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
      <Table className="max-w-[1000px] mx-auto table-fixed w-full">
        <TableHeader className="select-none">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedRows.length === data.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead className="w-[120px]">Invoice ID</TableHead>
            <TableHead className="w-[35%]">NAS Location</TableHead>
            <TableHead className="w-[120px]">Total</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="text-center w-[120px]">Actions</TableHead>
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
                />
              );
            })}
          {dataMemo.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No Data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
