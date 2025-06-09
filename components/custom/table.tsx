"use client";
import { results } from "@/db/generated/prisma";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import CustomRow from "./table-row";

export default function TableDisplay({ data = [] }: { data?: results[] }) {
  const dataMemo = useMemo(() => data, [data]);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

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

  return (
    <>
      <div className="w-full">
        <Button variant={"outline"} onClick={handleExpandAll}>
          {expandedRows.length > 0 ? "Collapse All" : "Expand All"}
        </Button>
      </div>
      <Table className="max-w-[1000px] mx-auto table-fixed w-full">
        <TableHeader className="select-none">
          <TableRow>
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
