import Footer from "@/components/custom/footer";
import Navbar from "@/components/custom/navbar";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
