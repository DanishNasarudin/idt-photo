import { results } from "@/db/generated/prisma";
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
  return (
    <Table className="max-w-[1000px] mx-auto">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Invoice ID</TableHead>
          <TableHead>NAS Location</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 &&
          data.map((item) => {
            return <CustomRow data={item} />;
          })}
        {data.length === 0 && (
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
