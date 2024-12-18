import type { Metadata } from "next";
import "./globals.css";
import Navigation from "../components/Navigation";
import { DataInitializer } from "@/components/DataInitializer";


export const metadata: Metadata = {
  title: "Moby Dashboard",
  description: "A simple dashboard for Moby",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="night">
      <body>
        <DataInitializer>
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="navbar bg-base-100">
              <div className="navbar-start">
                <div className="dropdown">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="navbar-center">
                <a className="btn btn-ghost text-xl">Moby</a>
              </div>
              <div className="navbar-end"></div>
            </div>
          </header>

          <main className="container mx-auto py-24">
            <div className="min-h-screen flex flex-col">
              <section className="flex-grow">{children}</section>    
            </div>
          </main>
          <Navigation />
        </DataInitializer>
      </body>
    </html>
  );
}
