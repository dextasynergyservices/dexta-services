"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DetailDialog } from "./detail-dialog";

interface Registration {
  id: string;
  name: string;
  email: string;
  event: string;
  status: string;
  createdAt: Date;
}

interface RegistrationsTableProps {
  registrations: Registration[];
  page: number;
  totalPages: number;
  total: number;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ACCEPTED: "bg-green-500/10 text-green-400 border-green-500/20",
  DECLINED: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function RegistrationsTable({
  registrations,
  page,
  totalPages,
  total,
}: RegistrationsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Registration | null>(null);

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-[#222] bg-[#111]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead scope="col" className="text-[#888]">
                Name
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Email
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Event
              </TableHead>
              <TableHead
                scope="col"
                className="hidden text-[#888] md:table-cell"
              >
                Status
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Date
              </TableHead>
              <TableHead scope="col" className="w-12 text-[#888]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-[#666]"
                >
                  No registrations found
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow
                  key={reg.id}
                  className="border-[#1a1a1a] hover:bg-[#1a1a1a]"
                >
                  <TableCell className="font-medium text-white">
                    {reg.name}
                  </TableCell>
                  <TableCell className="text-[#a0a0a0]">{reg.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-[#1a1a1a] text-[#a0a0a0]"
                    >
                      {reg.event}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant="outline"
                      className={statusColors[reg.status] ?? "text-[#666]"}
                    >
                      {reg.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#666]">
                    {formatDate(reg.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(reg)}
                      className="h-8 w-8 p-0 text-[#666] hover:text-cyan-400"
                      aria-label={`View details for ${reg.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-[#666]">
            Page {page} of {totalPages} ({total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              className="border-[#2a2a2a] bg-[#0d0d0d] text-white disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <DetailDialog registration={selected} onClose={() => setSelected(null)} />
    </>
  );
}
