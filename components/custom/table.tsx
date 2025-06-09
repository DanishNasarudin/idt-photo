"use client";
import { results } from "@/db/generated/prisma";
import { useMemo } from "react";
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

  console.log(dataMemo);
  return (
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
            return <CustomRow key={item.id} data={item} />;
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
  );
}
