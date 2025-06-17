import { Skeleton } from "../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function TableSkeleton({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) {
  return (
    <>
      <div className="w-full flex justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <Table className="max-w-[1000px] mx-auto table-fixed w-full">
        <TableHeader className="select-none">
          <TableRow className="[&>th]:text-foreground/60 [&>th]:overflow-hidden">
            <TableHead className="w-[50px]">
              <Skeleton className="h-6 w-full" />
            </TableHead>
            <TableHead className="w-[120px]">
              <Skeleton className="h-6 w-20" />
            </TableHead>
            {isAdmin && (
              <TableHead className="w-[120px]">
                <Skeleton className="h-6 w-20" />
              </TableHead>
            )}
            {isAdmin && (
              <TableHead className="w-[35%]">
                <Skeleton className="h-6 w-20" />
              </TableHead>
            )}
            <TableHead className="w-[120px]">
              <Skeleton className="h-6 w-20" />
            </TableHead>
            <TableHead className="w-[120px]">
              <Skeleton className="h-6 w-20" />
            </TableHead>
            {isAdmin && (
              <TableHead className="text-center w-[120px]">
                <Skeleton className="h-6 w-20" />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(10)].map((item, idx) => {
            return (
              <TableRow key={idx}>
                <TableCell>
                  <Skeleton className="h-[20.5px] w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[20.5px] w-full" />
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <Skeleton className="h-[20.5px] w-full" />
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell>
                    <Skeleton className="h-[20.5px] w-full" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-[20.5px] w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-[20.5px] w-full" />
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    <Skeleton className="h-[20.5px] w-full" />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
