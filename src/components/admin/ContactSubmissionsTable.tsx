import { useContactSubmissions } from "@/hooks/useContactSubmissions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Loader2, Users, CalendarDays, TrendingUp, Building } from "lucide-react";
import { format, startOfMonth, isAfter } from "date-fns";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

export default function ContactSubmissionsTable() {
  const { submissions, isLoading } = useContactSubmissions();
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const monthStart = startOfMonth(new Date());
    const thisMonth = submissions.filter((s) =>
      isAfter(new Date(s.created_at), monthStart)
    );
    const uniqueEmails = new Set(submissions.map((s) => s.email)).size;
    const withCompany = submissions.filter((s) => s.company).length;

    return {
      total: submissions.length,
      thisMonth: thisMonth.length,
      uniqueContacts: uniqueEmails,
      withCompany,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    if (!search.trim()) return submissions;
    const q = search.toLowerCase();
    return submissions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.company && s.company.toLowerCase().includes(q)) ||
        s.message.toLowerCase().includes(q)
    );
  }, [submissions, search]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Mail className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Total Requests</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">This Month</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.thisMonth}</p>
        </div>
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Unique Contacts</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.uniqueContacts}</p>
        </div>
        <div className="bg-background rounded-lg p-4 border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Building className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">With Company</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.withCompany}</p>
        </div>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by name, email, company, or message..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>{search ? "No matching submissions." : "No contact submissions yet."}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="min-w-[300px]">Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {format(new Date(sub.created_at), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell className="font-medium">{sub.name}</TableCell>
                  <TableCell>
                    <a href={`mailto:${sub.email}`} className="text-primary hover:underline">
                      {sub.email}
                    </a>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sub.company || "—"}</TableCell>
                  <TableCell className="text-sm max-w-md">
                    <p className="line-clamp-3">{sub.message}</p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
