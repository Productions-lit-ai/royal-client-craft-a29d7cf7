import { useContactSubmissions } from "@/hooks/useContactSubmissions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Mail, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function ContactSubmissionsTable() {
  const { submissions, isLoading } = useContactSubmissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>No contact submissions yet.</p>
      </div>
    );
  }

  return (
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
          {submissions.map((sub) => (
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
  );
}
