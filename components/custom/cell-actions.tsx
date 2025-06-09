import { deleteData } from "@/services/results";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type Props = { id?: number };

export default function CellActions({ id = -1 }: Props) {
  return (
    <div className="w-full h-full flex justify-center">
      <Button
        variant={"destructive"}
        size={"icon"}
        className="w-7 h-7"
        onClick={async (e) => {
          e.stopPropagation();
          toast.promise(deleteData(id), {
            loading: "Deleting data..",
            success: "Data deleted!",
            error: "Data failed to delete!",
          });
        }}
      >
        <Trash2 className="!w-4 !h-4" />
      </Button>
    </div>
  );
}
