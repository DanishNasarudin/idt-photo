import { UserButton } from "@clerk/nextjs";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { LogoIcon } from "./icons";
import { ModeToggle } from "./mode-toggle";

type Props = {};

export default function NavbarBackend({}: Props) {
  return (
    <nav className="z-[50] bg-background border-border border-b-[1px] sticky top-0 p-4 flex justify-between">
      <div className="flex gap-2">
        <Link href={"/"}>
          <Button variant={"outline"} size={"icon"}>
            <ChevronLeft />
          </Button>
        </Link>
        <Link href={"https://app.idealtech.com.my/home"}>
          <Button variant={"outline"} className="text-foreground/60">
            <LogoIcon /> Back to Main App
          </Button>
        </Link>
      </div>
      <div className="flex gap-2">
        <ModeToggle />
        <UserButton />
      </div>
    </nav>
  );
}
