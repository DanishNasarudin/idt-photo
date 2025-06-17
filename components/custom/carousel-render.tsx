import { searchData, SearchDataProps } from "@/services/results";
import CarouselDisplay from "./carousel";

export default async function CarouselRender({
  data,
}: {
  data: SearchDataProps;
}) {
  const render = await searchData(data);

  return <CarouselDisplay data={render.data} pagination={render.pagination} />;
}
