import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "../ui/button";

type Props = {
  name?: string;
  value?: string;
};

export default function CellCopy({ name = "default", value = "" }: Props) {
  const [_, copy] = useCopyToClipboard();
  return (
    <div className="w-full h-full relative group">
      <p className="select-none pointer-events-none">{value}</p>
      <Button
        variant={"outline"}
        size={"icon"}
        className="absolute hidden group-hover:flex h-8 w-8 top-[50%] translate-y-[-50%] right-0 tranlate-x-[-50%]"
        onClick={(e) => {
          e.stopPropagation();
          copy(value);
          toast.success(`${name} copied!`);
        }}
      >
        <Copy />
      </Button>
    </div>
  );
}
