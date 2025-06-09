import DataEntry from "@/components/custom/data-entry";
import InputSearch from "@/components/custom/input-search";
import Paginate from "@/components/custom/paginate";
import TableDisplay from "@/components/custom/table";
import { searchData } from "@/services/results";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  const query = (await searchParams)?.search || undefined;
  const currentPage = Number((await searchParams)?.page) || 1;

  const data = await searchData(query, currentPage);

  return (
    <div className="p-4 flex flex-col gap-4 items-center">
      <h1 className="font-bold text-lg">Insert PC Photo</h1>
      <DataEntry />
      <div className="max-w-[1000px] space-y-2">
        <h1 className="font-bold text-lg text-center py-4">PC Photos</h1>
        <InputSearch />
        <TableDisplay data={data.data} />
        <Paginate data={data.pagination} />
      </div>
      <div className="h-[200px]"></div>
    </div>
  );
}
