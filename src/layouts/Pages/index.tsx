import Footer from "./components/footer";
import Header from "./components/header";
import { ScrollProgress } from "@/common/Overlays";

type Props = {
  children: React.ReactNode;
};

const PagesLayout = ({ children }: Props) => {
  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />
      <ScrollProgress />
      <main className="wrap flex-1 section pt-[110px]">{children}</main>
      <Footer />
    </div>
  );
};

export default PagesLayout;
