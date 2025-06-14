import Footer from "@/components/custom/footer";
import NavbarBackend from "@/components/custom/navbar-backend";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <NavbarBackend />
      {children}
      <Footer />
    </div>
  );
}
