"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

const Editor = dynamic(() => import("@/components/editor/Editor"), { ssr: false });

export default function ModifyArticlePage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <AdminLayout title="Nouveau article">
      <div className="min-h-[calc(100vh-4.5rem)]">
        <Link href="/admin/articles" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ChevronLeft className="h-4 w-4" /> Articles
        </Link>
        <h1 className="text-2xl font-bold mb-4">Page Builder</h1>
        <Editor articleId={id} />
      </div>
    </AdminLayout>
  );
}
