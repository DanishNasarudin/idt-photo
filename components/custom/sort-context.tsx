"use client";
import { cn } from "@/lib/utils";
import { SortProps } from "@/services/results";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import SortModuleDraggable from "./sort-draggable";

type Props = {
  setSearchSort: Dispatch<SetStateAction<SortProps[]>>;
};

export type SortColumnType = {
  id: string;
  name: string;
  direction: "asc" | "desc";
};

const sortColumns: SortColumnType[] = [
  {
    id: "created_at",
    name: "Date",
    direction: "desc",
  },
  {
    id: "invNumber",
    name: "Invoice ID",
    direction: "desc",
  },
  {
    id: "total",
    name: "Total",
    direction: "desc",
  },
  {
    id: "status",
    name: "Status",
    direction: "desc",
  },
];

const SortModuleContext = () => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const [sortingList, setSortingList] = useLocalStorage<SortColumnType[]>(
    "my-sort-order",
    [
      {
        id: "created_at",
        name: "Date",
        direction: "desc",
      },
    ]
  );
  const [activeId, setActiveId] = useLocalStorage<string | null>(
    "my-sort-active",
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortingList((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSortingAdd = (e: string) => {
    const selectedColumn = sortColumns.find((item) => item.id === e);
    if (selectedColumn) {
      setSortingList((prev) => [...prev, selectedColumn]);
    }
  };

  useEffect(() => {
    const newSort: SortProps[] = sortingList.map((s) => ({
      type: s.id,
      direction: s.direction,
    }));

    const params = new URLSearchParams(searchParams.toString());
    if (newSort.length) {
      params.set(
        "sort",
        newSort.map((s) => `${s.type}:${s.direction}`).join(",")
      );
    } else {
      params.delete("sort");
    }
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [sortingList, searchParams, replace, pathname]);

  return (
    <div
      className={cn(
        "border-border border-[1px] rounded-md p-1 !py-[2.5px]",
        "flex gap-2"
      )}
    >
      <DndContext
        id={"unique-dnd-context"}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="w-min flex gap-2">
          <SortableContext
            items={sortingList}
            strategy={horizontalListSortingStrategy}
          >
            {sortingList.map((item) => (
              <SortModuleDraggable
                key={item.id}
                id={item.id}
                name={item.name}
                direction={item.direction}
                setSortingList={setSortingList}
              />
            ))}
          </SortableContext>
        </div>
        <DragOverlay>
          {activeId ? (
            <SortModuleDraggable
              id={activeId}
              name={sortingList.find((item) => item.id === activeId)?.name}
              direction={
                sortingList.find((item) => item.id === activeId)?.direction
              }
              setSortingList={setSortingList}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={"nothing"}
            size={"sm"}
            className={cn("mobilehover:hover:bg-white/20 h-6")}
          >
            + Add Sort
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup onValueChange={handleSortingAdd}>
            {sortColumns
              .filter(
                (item) => !sortingList.some((active) => active.id === item.id)
              )
              .map((item) => (
                <DropdownMenuRadioItem value={item.id} key={item.id}>
                  <Button
                    variant={"nothing"}
                    size={"sm"}
                    className="whitespace-nowrap"
                  >
                    {item.name}
                  </Button>
                </DropdownMenuRadioItem>
              ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SortModuleContext;
