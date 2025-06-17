import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import { Skeleton } from "../ui/skeleton";

export default function CarouselSkeleton() {
  const mockData = [...Array(3)];
  return (
    <Carousel className="mb-12 sm:mb-4">
      <CarouselContent>
        {mockData.map((item, idx) => (
          <CarouselItem key={idx} className="basis-1/2 sm:basis-1/3">
            <Skeleton className="max-w-[322px] w-full aspect-[64/43]" />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
