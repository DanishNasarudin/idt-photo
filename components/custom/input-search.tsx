"use client";
import { Loader2Icon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "../ui/input";

export default function InputSearch() {
  const searchParams = useSearchParams();

  const [value, setValue] = useState(
    searchParams.get("search")?.toString() || ""
  );
  const [debouncedValue, setDebouncedValue] = useState(
    searchParams.get("search")?.toString() || ""
  );

  const { replace } = useRouter();
  const pathname = usePathname();

  const handleSearch = useDebouncedCallback((term: string) => {
    setDebouncedValue(term);
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
      params.delete("page");
      params.delete("per_page");
    } else {
      params.delete("search");
      params.delete("page");
      params.delete("per_page");
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 250);

  const isLoading = useMemo(
    () => value !== debouncedValue,
    [value, debouncedValue]
  );

  return (
    <div className="relative w-full">
      <Input
        isSearch
        onChange={(e) => {
          const newValue = e.target.value;
          setValue(newValue);
          handleSearch(newValue);
        }}
        value={value}
        className="text-base"
        placeholder="Search pc photos"
      />
      {isLoading && (
        <div className="absolute top-[50%] translate-y-[-50%] right-8">
          <Loader2Icon className="animate-spin stroke-zinc-400 w-4 " />
        </div>
      )}
      {value && (
        <X
          size={14}
          className="absolute top-[50%] right-2 translate-y-[-50%] stroke-zinc-400 cursor-pointer"
          onClick={() => {
            setValue("");
            handleSearch("");
          }}
        />
      )}
    </div>
  );
}
