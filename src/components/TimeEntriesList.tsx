import { Download, Clock, User, Briefcase, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TimeEntry } from "@/types/timeEntry";
import { format } from "date-fns";
import * as XLSX from "xlsx";

interface TimeEntriesListProps {
  entries: TimeEntry[];
  onClearEntries: () => void;
}

export const TimeEntriesList = ({
  entries,
  onClearEntries,
}: TimeEntriesListProps) => {
  const exportToExcel = () => {
    if (entries.length === 0) return;

    const exportData = entries.map((entry) => ({
      "User Name": entry.userName,
      Task: entry.task,
      "Start Time": format(new Date(entry.startTime), "yyyy-MM-dd HH:mm:ss"),
      "End Time": format(new Date(entry.endTime), "yyyy-MM-dd HH:mm:ss"),
      Duration: entry.formattedDuration,
      "Duration (seconds)": entry.duration,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Time Entries");

    // Auto-size columns
    const maxWidth = 20;
    worksheet["!cols"] = Object.keys(exportData[0]).map(() => ({
      wch: maxWidth,
    }));

    XLSX.writeFile(
      workbook,
      `time-entries-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
  };

  const totalDuration = entries.reduce((acc, entry) => acc + entry.duration, 0);
  const formatTotalTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <Card className="w-full shadow-[var(--shadow-card)] border-0 bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Clock className="w-5 h-5 text-primary" />
            Time Entries
          </CardTitle>
          {entries.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Total: {formatTotalTime(totalDuration)} ({entries.length} entries)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {entries.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearEntries}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={exportToExcel}
                size="sm"
                className="shadow-[var(--shadow-button)]"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No time entries yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start tracking to see your entries here
            </p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Task
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold">Start</TableHead>
                  <TableHead className="font-semibold">End</TableHead>
                  <TableHead className="font-semibold text-right">
                    Duration
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.userName}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {entry.task}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(entry.startTime), "HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(entry.endTime), "HH:mm:ss")}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium text-accent">
                      {entry.formattedDuration}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
