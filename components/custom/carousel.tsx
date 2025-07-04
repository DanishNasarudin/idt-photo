"use client";
import { results } from "@/db/generated/prisma";
import { cn } from "@/lib/utils";
import { Pagination } from "@/services/results";
import equal from "fast-deep-equal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo, useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import SmartImage from "./smart-image";

function CarouselDisplayPure({
  data,
  pagination,
}: {
  data: results[];
  pagination: Pagination;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [slidesToScroll, setSlidesToScroll] = useState<number>(3);
  const [pageValue, setPageValue] = useState(
    Number(searchParams.get("page")?.toString()) || pagination.currentPage || 1
  );
  const [cacheBypass, setCacheBypass] = useState(false);
  const [embla, setEmbla] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const dataMemo = useMemo(() => {
    embla?.scrollTo(0);
    return data;
  }, [data]);

  useEffect(() => {
    if (pagination.currentPage !== pageValue)
      setPageValue(pagination.currentPage);
  }, [pagination]);

  useEffect(() => {
    const updateSlides = () => {
      setSlidesToScroll(window.innerWidth < 640 ? 2 : 3);
    };
    updateSlides();
    window.addEventListener("resize", updateSlides);
    return () => window.removeEventListener("resize", updateSlides);
  }, []);

  useEffect(() => {
    if (!embla) return;
    const updateButtons = () => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    };
    updateButtons();
    embla.on("select", updateButtons);
    embla.on("reInit", updateButtons);
    return () => {
      embla.off("select", updateButtons);
      embla.off("reInit", updateButtons);
    };
  }, [embla]);

  const handleSelect = (term: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("select", String(term));
    } else {
      params.delete("select");
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    setPageValue(page);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Carousel
      setApi={setEmbla}
      className="mb-12 sm:mb-4"
      opts={{ slidesToScroll }}
    >
      <CarouselContent>
        {dataMemo.map((item, idx) => (
          <CarouselItem
            key={item.id}
            className="basis-1/2 sm:basis-1/3"
            onClick={() => handleSelect(item.id)}
          >
            <SmartImage
              data-loaded="false"
              onLoad={(e) =>
                e.currentTarget.setAttribute("data-loaded", "true")
              }
              priority={idx <= 3}
              src={`/api${item.imagePath}` || ""}
              alt={`${item.id}`}
              width={322}
              height={215}
              className={cn(
                "data-[loaded=false]:bg-foreground/30 data-[loaded=false]:animate-pulse w-full h-auto object-cover rounded-lg border-transparent hover:border-foreground/60 border-[1px] transition-all cursor-pointer"
              )}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {dataMemo.length > slidesToScroll && (
        <>
          <CarouselPrevious
            onClick={() =>
              canScrollPrev ? embla!.scrollPrev() : handlePage(pageValue - 1)
            }
            disabled={!canScrollPrev && pageValue <= 1}
            hasMorePage={!canScrollPrev && pageValue > 1}
          />
          <CarouselNext
            onClick={() =>
              canScrollNext ? embla!.scrollNext() : handlePage(pageValue + 1)
            }
            disabled={!canScrollNext && !pagination.hasNextPage}
            hasMorePage={!canScrollNext && pagination.hasNextPage}
          />
        </>
      )}
    </Carousel>
  );
}

export const CarouselDisplay = memo(
  CarouselDisplayPure,
  (prevProps, nextProps) => {
    if (!equal(prevProps, nextProps)) return false;
    return true;
  }
);
