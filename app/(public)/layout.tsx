import Footer from "@/components/custom/footer";
import Navbar from "@/components/custom/navbar";
import { getNavbarMenu } from "@/services/navbarActions";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const menuList = await getNavbarMenu();

  return (
    <div className="flex flex-col flex-1">
      <Navbar menuList={menuList} />
      {children}
      <Footer />
    </div>
  );
}
