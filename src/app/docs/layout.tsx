import Link from "next/link";
import { listDocLinks } from "@/lib/repository";
import { SignOutButton } from "@/components/sign-out-button";
import { getSession } from "@/lib/auth";
import { DocsSidebar } from "@/components/docs-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

export const dynamic = "force-dynamic";

export default async function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const docs = await listDocLinks();
  const session = await getSession();
  const canManage = Boolean(session && ["editor", "admin"].includes(session.role));
  return <div className="docs-shell"><header className="docs-header"><div className="docs-header-inner"><Link href="/docs" className="brand-link"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="9" fill="currentColor"/><path d="M9 8.5h8.5a5.5 5.5 0 1 1 0 11H13v4H9v-15Zm4 3.5v4h4.5a2 2 0 1 0 0-4H13Z" fill="white"/><path d="M19 22.5h4v2h-4z" fill="white"/></svg></span><span>Docsies <span className="brand-slash">/</span> Runbooks</span></Link><div className="header-actions"><ThemeToggle /><SignOutButton /></div></div></header><div className="docs-layout"><DocsSidebar docs={docs} canManage={canManage} /><section className="docs-main">{children}</section></div></div>;
}
