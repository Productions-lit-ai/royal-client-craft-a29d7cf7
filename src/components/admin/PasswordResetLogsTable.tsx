import { usePasswordResetLogs } from "@/hooks/usePasswordResetLogs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function PasswordResetLogsTable() {
  const { data: logs, isLoading, error } = usePasswordResetLogs();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">Failed to load reset logs.</p>;
  }

  if (!logs || logs.length === 0) {
    return <p className="text-muted-foreground text-sm">No password reset activity yet.</p>;
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "requested": return "secondary";
      case "rate_limited": return "destructive";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell className="text-sm">{log.email}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
