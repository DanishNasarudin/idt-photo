import { searchData, SearchDataProps } from "@/services/results";
import TableDisplay from "./table";

export default async function TableRender({
  data,
  currentSelected,
  isAdmin = false,
}: {
  data: SearchDataProps;
  currentSelected: number | null;
  isAdmin?: boolean;
}) {
  const render = await searchData(data);

  return (
    <TableDisplay
      data={render.data}
      selectedRow={currentSelected}
      isAdmin={isAdmin}
    />
  );
}
