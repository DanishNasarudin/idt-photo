"use client";

import { Pagination } from "@/services/results";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

export default function Paginate({ data }: { data: Pagination }) {
  const searchParams = useSearchParams();

  const [pageValue, setPageValue] = useState(
    Number(searchParams.get("page")?.toString()) || data.currentPage || 1
  );
  const [perPageValue, setPerPageValue] = useState(
    Number(searchParams.get("perPage")?.toString()) || data.items.perPage || 1
  );

  const { replace } = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (data.currentPage !== pageValue) setPageValue(data.currentPage);
    if (data.items.perPage !== perPageValue)
      setPerPageValue(data.items.perPage);
  }, [data]);

  const handlePage = (term: number) => {
    const params = new URLSearchParams(searchParams.toString());
    setPageValue(term);
    if (term) {
      params.set("page", String(term));
    } else {
      params.delete("page");
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePerPage = (term: number) => {
    const params = new URLSearchParams(searchParams.toString());
    setPerPageValue(term);
    if (term) {
      params.set("perPage", String(term));
    } else {
      params.delete("perPage");
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex gap-2 sm:items-center items-end justify-between max-w-[1000px] w-full text-sm">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"}>
            {perPageValue} Rows <ChevronsUpDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup
            defaultValue={"10"}
            onValueChange={(e) => handlePerPage(Number(e))}
          >
            <DropdownMenuRadioItem value="10">10 Rows</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="20">20 Rows</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="50">50 Rows</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="100">100 Rows</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex gap-2 sm:items-center sm:flex-row flex-col items-end">
        <span className="text-foreground/50">
          {(data.currentPage - 1) * data.items.perPage + 1} -{" "}
          {Math.min(data.currentPage * data.items.perPage, data.items.total)} of{" "}
          {data.items.total} | Page {data.currentPage} of {data.lastVisiblePage}
        </span>
        <div className="flex gap-2">
          <Button
            onClick={() => handlePage(1)}
            disabled={data.currentPage === 1}
            variant={"outline"}
            size={"icon"}
          >
            <ChevronFirst />
          </Button>
          <Button
            onClick={() => handlePage(data.currentPage - 1)}
            disabled={data.currentPage === 1}
            variant={"outline"}
            size={"icon"}
          >
            <ChevronLeft />
          </Button>
          <Input
            value={pageValue}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
                handlePage(
                  Number(e.currentTarget.value) > 0
                    ? Number(e.currentTarget.value)
                    : 1
                );
              }
            }}
            onBlur={(e) => {
              console.log(
                Number(searchParams.get("page")?.toString()),
                Number(e.currentTarget.value),
                pageValue !== Number(e.currentTarget.value)
              );
              if (
                Number(searchParams.get("page")?.toString()) !==
                Number(e.currentTarget.value)
              )
                handlePage(
                  Number(e.currentTarget.value) > 0
                    ? Number(e.currentTarget.value)
                    : 1
                );
            }}
            onChange={(e) => setPageValue(Number(e.target.value))}
            className="w-9 h-9 p-0 justify-center items-center text-center"
          />
          <Button
            onClick={() => handlePage(data.currentPage + 1)}
            disabled={!data.hasNextPage}
            variant={"outline"}
            size={"icon"}
          >
            <ChevronRight />
          </Button>
          <Button
            onClick={() => handlePage(data.lastVisiblePage)}
            disabled={!data.hasNextPage}
            variant={"outline"}
            size={"icon"}
          >
            <ChevronLast />
          </Button>
        </div>
      </div>
    </div>
  );
}
