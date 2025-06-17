import CarouselDisplay from "@/components/custom/carousel";
import InputSearch from "@/components/custom/input-search";
import Paginate from "@/components/custom/paginate";
import TableDisplay from "@/components/custom/table";
import { searchData } from "@/services/results";

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

  const data = await searchData(query, currentPage, currentPerPage);

  return (
    <div className="p-4 flex flex-col gap-4 items-center flex-1">
      <div className="max-w-[1000px] space-y-2 w-full">
        <h1 className="font-bold text-lg text-center py-4">PC Photos</h1>
        <CarouselDisplay data={data.data} pagination={data.pagination} />
        <InputSearch />
        <TableDisplay data={data.data} selectedRow={currentSelected} />
        <Paginate data={data.pagination} />
      </div>
      <div className="h-[200px]"></div>
    </div>
  );
}
