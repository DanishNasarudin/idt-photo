"use client";
import { parseComponents } from "@/scripts/populate-components";
import { checkDuplicates, createData } from "@/services/results";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import DataImage, { PreviewFile } from "./data-image";
import DataPreview from "./data-preview";

export type SanitiseInputProps = {
  invNumber: string;
  total: string;
  originalContent: string;
  nasLocation: string;
  image: PreviewFile | null;
  errorMessage: string | null;
};

export default function DataEntry() {
  const [images, setImages] = useState<PreviewFile[]>([]);
  const [specs, setSpecs] = useState("");
  const [nasLocation, setNasLocation] = useState("");
  const [sanitisedData, setSanitisedData] = useState<SanitiseInputProps[]>([]);

  const sanitiseInput = async (): Promise<SanitiseInputProps[]> => {
    const specsRegex = /INV#:\s*(\S*)[\s\S]*?Total\s*:\s*(RM\s?[0-9,]+)/gi;
    const invoices = Array.from(specs.matchAll(specsRegex));
    const filteredInvoices = invoices
      .map((item) => item[1].replace(/-/g, ""))
      .filter((item) => item);

    const duplicateIdsInDb = await checkDuplicates(filteredInvoices);

    const requiredSpecs = ["INV#", "CPU", "GPU", "CASE", "MOBO", "RAM", "PSU"];

    return invoices.map((inv) => {
      const invoiceNumber = inv[1].replace(/-/g, "");
      const invoiceTotal = inv[2].replace(/\s+(?=\d)|,/g, "").replace(" ", "");

      let originalContent = inv[0]
        .replace(/Total\s*:\s*/i, "Total: ")
        .replace(/(?<=RAM:\s*)GSKILL/i, "G.SKILL")
        .replace(/(?<=CPU:\s*)INTEL(?!\s+CORE)/i, "INTEL CORE")
        .trim();

      const assignedImage =
        images.find((file) => {
          const regex = new RegExp(`${invoiceNumber}(?:\\s*\\(\\d+\\))?`, "i");
          return regex.test(file.name);
        }) || null;

      const missingSpecs = requiredSpecs.filter(
        (spec) => !originalContent.includes(spec)
      );

      const existingInvoices =
        filteredInvoices.filter((i) => i === invoiceNumber).length > 1;

      const existingInvoicesInDb =
        duplicateIdsInDb
          .map((i) => (i.invNumber === null ? "" : i.invNumber))
          .filter((i) => i === invoiceNumber).length > 0;

      let errorMessage = "";

      if (!invoiceNumber) {
        errorMessage += `Missing or empty INV#, ensure that the invoice number is provided.\n`;
      }

      if (existingInvoicesInDb) {
        errorMessage += `INV# ${invoiceNumber} already exists in database.\n`;
      }

      if (existingInvoices) {
        errorMessage += `Multiple INV#: ${invoiceNumber} detected, ensure invoice number is unique.\n`;
      }

      if (!assignedImage) {
        errorMessage += `Missing image, ensure image filename matches INV#.\n`;
      }

      if (missingSpecs.length > 0) {
        errorMessage += `Missing ${missingSpecs.join(
          ", "
        )}, ensure spec list format is correct.\n`;
      }

      return {
        invNumber: invoiceNumber,
        total: invoiceTotal,
        originalContent,
        nasLocation,
        image: assignedImage,
        errorMessage: errorMessage || null,
      };
    });
  };

  const uploadFile = async (
    file: File,
    toastId: string | number
  ): Promise<string> => {
    toast.loading(`Uploading ${file.name}`, { id: toastId });
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      toast.error(`Failed to upload ${file.name}`, { id: toastId });
      throw new Error("Upload failed");
    }

    const json = await response.json();
    return json.path as string;
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const sanitised = await sanitiseInput();
      setSanitisedData(sanitised);
      if (
        sanitised.some((item) => item.errorMessage !== null) ||
        sanitisedData.some((item) => item.errorMessage !== null) ||
        sanitisedData.length === 0
      )
        return;

      const toastId = toast.loading("Starting upload...");
      const nameToPath: Record<string, string> = {};

      try {
        for (const img of images) {
          const path = await uploadFile(img, toastId);
          nameToPath[img.name] = path;
        }

        toast.loading("Inserting to database...", { id: toastId });

        const payload = sanitised.map((item) => ({
          invNumber: item.invNumber,
          total: item.total,
          originalContent: item.originalContent,
          nasLocation: item.nasLocation,
          imagePath: item.image ? nameToPath[item.image.name] : null,
          status: "Ready",
          ...parseComponents(item.originalContent),
        }));

        const res = await createData(payload);

        if (!res) throw new Error("Insert failed");
        setSanitisedData([]);
        setSpecs("");
        setNasLocation("");
        setImages([]);
        toast.success("Data saved successfully", { id: toastId });
      } catch (err) {
        toast.error("An error occurred", { id: toastId });
      }
    },
    [sanitisedData, setSanitisedData, sanitiseInput, images, specs, nasLocation]
  );

  const handleOnValueChange = useCallback((id: string, newValue: any) => {
    if (id === "images") setImages(newValue);
    if (id === "specification") setSpecs(newValue);
    if (id === "nas-location") setNasLocation(newValue);
  }, []);

  return (
    <form
      className="flex flex-col gap-4 max-w-[1000px] w-full"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <Label htmlFor="images">Images:</Label>
        <DataImage
          value={images}
          onValueChange={(e) => handleOnValueChange("images", e)}
        />
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
      <div className="flex w-full justify-end gap-2">
        {sanitisedData.length > 0 &&
        !sanitisedData.some((item) => item.errorMessage !== null) ? (
          <Button
            type="submit"
            className="bg-green-700 hover:bg-green-800 max-w-max"
          >
            Confirm
          </Button>
        ) : (
          <Button type="submit" className="max-w-max text-white">
            {sanitisedData.length === 0 ? "Submit" : "Revalidate"}
          </Button>
        )}
      </div>

      {sanitisedData.length > 0 && <DataPreview data={sanitisedData} />}
    </form>
  );
}
