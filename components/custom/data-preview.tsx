import { cn } from "@/lib/utils";
import { CircleAlert, Copy } from "lucide-react";
import { useCopyToClipboard } from "usehooks-ts";
import { Button } from "../ui/button";
import { SanitiseInputProps } from "./data-entry";

type Props = {
  data: SanitiseInputProps[];
};

export default function DataPreview({ data }: Props) {
  const [_, copy] = useCopyToClipboard();

  const errorInvoice = data
    .filter((item) => item.errorMessage !== null)
    .map((item) => item.invNumber);

  return (
    <div className="flex flex-col gap-8 w-full">
      {errorInvoice.length > 0 && (
        <div className="flex gap-2 w-full bg-destructive/5 rounded-lg border-destructive/10 border-[1px] items-center">
          <Button
            variant={"ghost"}
            size={"icon"}
            className="text-destructive pointer-events-none"
          >
            <CircleAlert />
          </Button>
          <pre className="text-destructive text-xs">Error at:</pre>
          <div className="">
            {errorInvoice.map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="text-xs text-destructive bg-destructive/5 border-destructive/10 border-[1px] rounded-md p-1 px-2 hover:bg-destructive/10 transition-all cursor-pointer"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      )}
      {data.map((item) => {
        return (
          <div
            key={item.invNumber}
            id={item.invNumber}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-0">
              <div className="flex gap-2 items-center">
                <p className="text-primary font-bold">{item.invNumber}</p>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => copy(item.invNumber)}
                  className="w-8 h-8 text-foreground/60"
                >
                  <Copy />
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <p>{item.nasLocation}</p>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => copy(item.nasLocation)}
                  className="w-8 h-8 text-foreground/60"
                >
                  <Copy />
                </Button>
              </div>
            </div>
            <div className="border-border border-[1px] rounded-lg flex gap-8 p-4">
              <div className="flex w-full overflow-x-auto text-foreground/60 text-xs">
                <pre>{item.originalContent}</pre>
              </div>
              <div
                className={cn(
                  "flex w-full justify-center items-center rounded-lg",
                  !item.image && "bg-destructive/5"
                )}
              >
                {item.image ? (
                  <img
                    src={item.image?.preview}
                    alt={item.image?.name}
                    className="w-full h-auto object-cover rounded-lg"
                    draggable={false}
                  />
                ) : (
                  <p className="text-destructive text-xs">Missing Image</p>
                )}
              </div>
            </div>
            {item.errorMessage && (
              <div className="flex gap-2 w-full bg-destructive/5 rounded-lg border-destructive/10 border-[1px]">
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  className="text-destructive pointer-events-none"
                >
                  <CircleAlert />
                </Button>
                <pre className="text-destructive text-xs py-2.5">
                  {item.errorMessage}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
