import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous"},
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,100,1,200&icon_names=mic,photo_camera,search,send&display=block",},
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Varela+Round&family=Noto+Sans:ital,wdth,wght@0,62.5..100,100..900;1,62.5..100,100..900&display=block",},
  { rel: "stylesheet", href: "https://cdn.jsdelivr.net/gh/lipis/flag-icons@7.0.0/css/flag-icons.min.css",},
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <Meta/>
        <Links/>
      </head>
      <body>
        {children}
        <ScrollRestoration/>
        <Scripts/>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet/>;
}
