import type {Metadata} from "next";
import {TelegramMiniAppShell} from "@/components/TelegramMiniAppShell";

export const metadata:Metadata={
 title:"Aslal Catalog",
 description:"Browse Aslal products and services in Telegram.",
 icons:{icon:"/favicon.svg",apple:"/favicon.svg"},
};

export default function TelegramCatalogLayout({children}:{children:React.ReactNode}){
 return <TelegramMiniAppShell>{children}</TelegramMiniAppShell>;
}
