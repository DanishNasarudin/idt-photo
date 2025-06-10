import CarouselDisplay from "@/components/custom/carousel";
import DataEntry from "@/components/custom/data-entry";
import InputSearch from "@/components/custom/input-search";
import Paginate from "@/components/custom/paginate";
import TableDisplay from "@/components/custom/table";
import { searchData } from "@/services/results";

export default async function AdminPage({
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
    <div className="p-4 pt-8 flex flex-col gap-4 items-center">
      <h1 className="font-bold text-lg">Insert PC Photo</h1>
      <DataEntry />
      <div className="max-w-[1000px] space-y-2">
        <h1 className="font-bold text-lg text-center py-4">PC Photos</h1>
        <CarouselDisplay data={data.data} />
        <InputSearch />
        <TableDisplay data={data.data} selectedRow={currentSelected} isAdmin />
        <Paginate data={data.pagination} />
      </div>
      <div className="h-[200px]"></div>
    </div>
  );
}
