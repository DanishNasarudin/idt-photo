import DataEntry from "@/components/custom/data-entry";
import TableDisplay from "@/components/custom/table";
import { searchData } from "@/services/results";

export default async function AdminPage() {
  const data = await searchData();
  console.log(data, "Updated");
  return (
    <div className="p-4 flex flex-col gap-4 items-center">
      Hi
      <DataEntry />
      <TableDisplay data={data} />
      <div className="h-[200px]"></div>
    </div>
  );
}
