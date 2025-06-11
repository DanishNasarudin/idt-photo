"use client";
import { results } from "@/db/generated/prisma";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

type Props = {};

export default function CarouselDisplay({ data }: { data: results[] }) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (term: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("select", String(term));
    } else {
      params.delete("select");
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Carousel className="pb-4">
      <CarouselContent>
        {data.map((item) => (
          <CarouselItem
            key={item.id}
            className="sm:basis-1/3"
            onClick={() => handleSelect(item.id)}
          >
            <img
              src={item.imagePath || ""}
              className={cn(
                "w-full h-auto object-cover rounded-lg border-transparent hover:border-foreground/60 border-[1px] transition-all cursor-pointer"
              )}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {data.length > 3 && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
}
