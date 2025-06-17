import CarouselRender from "@/components/custom/carousel-render";
import CarouselSkeleton from "@/components/custom/carousel-skeleton";
import DataEntry from "@/components/custom/data-entry";
import InputSearch from "@/components/custom/input-search";
import Paginate from "@/components/custom/paginate";
import TableRender from "@/components/custom/table-render";
import TableSkeleton from "@/components/custom/table-skeleton";
import { searchData, SearchDataProps, SortProps } from "@/services/results";
import { Suspense } from "react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{
    search?: string;
    page?: string;
    perPage?: string;
    select?: string;
    sort?: string;
  }>;
}) {
  const query = (await searchParams)?.search || undefined;
  const currentPage = Number((await searchParams)?.page) || 1;
  const currentPerPage = Number((await searchParams)?.perPage) || 10;
  const currentSelected = Number((await searchParams)?.select) || null;
  const currentSort = (await searchParams)?.sort || undefined;

  const parseSort =
    currentSort
      ?.split(",")
      .map((item) => {
        const [type, direction] = item.split(":");
        if (type && direction) {
          return { type, direction } as SortProps;
        }
        return null;
      })
      .filter((entry): entry is SortProps => entry !== null) || [];

  const data = await searchData({
    query,
    page: currentPage,
    perPage: currentPerPage,
    isAdmin: true,
    sort: parseSort,
  });
  const dataPayload: SearchDataProps = {
    query,
    page: currentPage,
    perPage: currentPerPage,
    isAdmin: true,
    sort: parseSort,
  };

  return (
    <div className="p-4 pt-8 flex flex-col gap-4 items-center">
      <h1 className="font-bold text-lg">Insert PC Photo</h1>
      <DataEntry />
      <div className="max-w-[1000px] space-y-2 border-border border-t-[1px] w-full">
        <h1 className="font-bold text-lg text-center py-4">PC Photos</h1>
        <Suspense
          key={`carousel-${query ?? ""}-${currentPage}-${currentPerPage}-${
            currentSort ?? ""
          }`}
          fallback={<CarouselSkeleton />}
        >
          <CarouselRender data={dataPayload} />
        </Suspense>
        <InputSearch />
        <Suspense
          key={`${query ?? ""}-${currentPage}-${currentPerPage}-${
            currentSort ?? ""
          }`}
          fallback={<TableSkeleton perPage={currentPerPage} isAdmin />}
        >
          <TableRender
            data={dataPayload}
            currentSelected={currentSelected}
            isAdmin
          />
        </Suspense>
        <Paginate data={data.pagination} />
      </div>
      <div className="h-[200px]"></div>
    </div>
  );
}
