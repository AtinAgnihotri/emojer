import { useUser } from "@clerk/nextjs";
import { LoadingPage } from "./Loading";
import { type PropsWithChildren } from "react";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const user = useUser();

  if (!user.isLoaded) return <LoadingPage />;
  return (
    <main className="flex h-screen justify-center">
      <div className="no-scrollbar h-full w-full flex-col overflow-y-scroll border-x  border-slate-400 md:max-w-2xl">
        {children}
      </div>
    </main>
  );
};

export default Layout;
