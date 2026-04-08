"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EventStatusBadge } from "./status-badge";
import { deleteEvent } from "@/app/admin/(dashboard)/events/actions";

interface EventRow {
  id: string;
  title: string;
  dateTime: Date;
  location: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  attendeeLimit: number | null;
  _count: { registrations: number };
  acceptedCount: number;
}

interface EventListProps {
  events: EventRow[];
  total: number;
  page: number;
  totalPages: number;
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EventList({ events, total, page, totalPages }: EventListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.replace(`/admin/events?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        updateParams("search", value);
      }, 300);
    },
    [updateParams],
  );

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", p.toString());
    router.push(`/admin/events?${params.toString()}`);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteEvent(deleteId);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setDeleteId(null);
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#555]" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border-[#2a2a2a] bg-[#0d0d0d] pl-9 text-white placeholder-[#444]"
            aria-label="Search events"
          />
        </div>

        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(val) =>
            updateParams("status", val === "all" ? "" : val)
          }
        >
          <SelectTrigger
            className="w-36 border-[#2a2a2a] bg-[#0d0d0d] text-white"
            aria-label="Filter by status"
          >
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="border-[#2a2a2a] bg-[#111]">
            <SelectItem
              value="all"
              className="text-white focus:bg-[#1a1a1a] focus:text-white"
            >
              All statuses
            </SelectItem>
            <SelectItem
              value="DRAFT"
              className="text-white focus:bg-[#1a1a1a] focus:text-white"
            >
              Draft
            </SelectItem>
            <SelectItem
              value="PUBLISHED"
              className="text-white focus:bg-[#1a1a1a] focus:text-white"
            >
              Published
            </SelectItem>
            <SelectItem
              value="CLOSED"
              className="text-white focus:bg-[#1a1a1a] focus:text-white"
            >
              Closed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#222] bg-[#111]">
        <Table>
          <TableHeader>
            <TableRow className="border-[#222] hover:bg-transparent">
              <TableHead scope="col" className="text-[#888]">
                Title
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Date
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Location
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Status
              </TableHead>
              <TableHead scope="col" className="text-[#888]">
                Registrations
              </TableHead>
              <TableHead scope="col" className="w-24 text-[#888]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-[#666]"
                >
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow
                  key={event.id}
                  className="border-[#1a1a1a] hover:bg-[#1a1a1a]"
                >
                  <TableCell className="font-medium text-white">
                    {event.title}
                  </TableCell>
                  <TableCell className="text-[#a0a0a0]">
                    {formatDate(event.dateTime)}
                  </TableCell>
                  <TableCell className="text-[#a0a0a0]">
                    {event.location}
                  </TableCell>
                  <TableCell>
                    <EventStatusBadge status={event.status} />
                  </TableCell>
                  <TableCell className="text-[#a0a0a0]">
                    {event.acceptedCount}
                    {event.attendeeLimit ? ` / ${event.attendeeLimit}` : ""}
                    <span className="ml-1 text-[#555]">
                      ({event._count.registrations} total)
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 text-[#666] hover:text-cyan-400"
                      >
                        <Link
                          href={`/admin/events/${event.id}`}
                          aria-label={`View ${event.title}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0 text-[#666] hover:text-white"
                      >
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          aria-label={`Edit ${event.title}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(event.id)}
                        className="h-8 w-8 p-0 text-[#666] hover:text-red-400"
                        aria-label={`Delete ${event.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
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

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent className="border-[#2a2a2a] bg-[#111] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#888]">
              This will permanently delete the event and all its registrations.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
