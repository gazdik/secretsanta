import { t } from "i18next";
import { MenuItem, SideMenu } from "./SideMenu";
import { NavBar90s } from "./NavBar90s";
import { Footer90s } from "./Footer90s";

export type LayoutProps = {
  menuItems: React.ReactNode[];
  children: React.ReactNode;
};

export function Layout({ menuItems, children }: LayoutProps) {
  return (
    <div className="snow-bg flex flex-col min-h-screen">
      <NavBar90s />
      <div className="flex-1 p-4 md:p-6">
        <div className="container mx-auto max-w-6xl">
          <SideMenu>
            {menuItems}
          </SideMenu>

          <div className="my-2 md:my-4 flex flex-col justify-around lg:flex-row gap-4 md:gap-6 lg:gap-8">
            {children}
          </div>
        </div>
      </div>
      <Footer90s />
    </div>
  );
}
