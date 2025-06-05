"use client";
import { useCallback, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import DataImage from "./data-image";

export default function DataEntry() {
  const [images, setImages] = useState<File[]>([]);
  const [specs, setSpecs] = useState("");
  const [nasLocatiom, setNasLocation] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(() => {});
  };

  const handleOnValueChange = useCallback((id: string, newValue: any) => {
    switch (id) {
      case "images":
        setImages(newValue);
        break;
      case "specification":
        setSpecs(newValue);
        break;
      case "nas-location":
        setNasLocation(newValue);
        break;
      default:
        break;
    }
  }, []);

  return (
    <form
      className="flex flex-col gap-4 max-w-[600px] w-full"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="images">Images:</Label>
        <DataImage onValueChange={(e) => handleOnValueChange("images", e)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="specification">Specifications:</Label>
        <Textarea
          id="specification"
          rows={14}
          placeholder={`INV#: SE532-24\nCPU: INTEL I7-14700F\nACCESSORIES: PALADIN BCF INTEL 12GEN CONTACT FRAME\nCOOLER: PC COOLER RZ620\nMOBO: GIGABYTE B760M AORUS PRO AX DDR5\nRAM: GSKILL RIPJAWS S5 2x16GB DDR5 5200MHz (BLACK)\nGPU: MSI GEFORCE RTX4070 VENTUS 2X E 12GB OC\nPSU: ANTEC CSK650 GB 80+ BRONZE\nCASE: JONSBO D41 MESH SCREEN BLACK\nSSD: T-FORCE G70 PRO M.2 PCIe SSD 1TB (DRAM CACHE)\nHDD: SEAGATE 2TB BARACUDA HDD\n\nTotal: RM7,660`}
          required
          onChange={(e) => handleOnValueChange(e.target.id, e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nas-location">NAS Location:</Label>
        <Input
          id="nas-location"
          type="text"
          placeholder="W:\2024\2410_October Projects\241004_Photo"
          required
          onChange={(e) => handleOnValueChange(e.target.id, e.target.value)}
        />
      </div>
      <Button type="submit">Submit</Button>
    </form>
  );
}
