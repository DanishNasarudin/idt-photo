import CarouselRender from "@/components/custom/carousel-render";
import CarouselSkeleton from "@/components/custom/carousel-skeleton";
import InputSearch from "@/components/custom/input-search";
import Paginate from "@/components/custom/paginate";
import TableRender from "@/components/custom/table-render";
import TableSkeleton from "@/components/custom/table-skeleton";
import { searchData, SearchDataProps } from "@/services/results";
import { Suspense } from "react";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    perPage?: string;
    select?: string;
  }>;
}) {
  const query = (await searchParams)?.search || undefined;
  const currentPage = Number((await searchParams)?.page) || 1;
  const currentPerPage = Number((await searchParams)?.perPage) || 10;
  const currentSelected = Number((await searchParams)?.select) || null;

  const data = await searchData({
    query,
    page: currentPage,
    perPage: currentPerPage,
  });
  const dataPayload: SearchDataProps = {
    query,
    page: currentPage,
    perPage: currentPerPage,
  };

  return (
    <div className="p-4 flex flex-col gap-4 items-center flex-1">
      <div className="max-w-[1000px] space-y-2 w-full">
        <h1 className="font-bold text-lg text-center py-4">PC Photos</h1>
        <Suspense
          key={`carousel-${query ?? ""}-${currentPage}-${currentPerPage}-${
            currentSelected ?? ""
          }`}
          fallback={<CarouselSkeleton />}
        >
          <CarouselRender data={dataPayload} />
        </Suspense>
        <InputSearch />
        <Suspense
          key={`${query ?? ""}-${currentPage}-${currentPerPage}-${
            currentSelected ?? ""
          }`}
          fallback={<TableSkeleton />}
        >
          <TableRender data={dataPayload} currentSelected={currentSelected} />
        </Suspense>
        <Paginate data={data.pagination} />
      </div>
      <div className="h-[200px]"></div>
    </div>
  );
}
