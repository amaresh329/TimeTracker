import { useState, useEffect, useCallback } from "react";
import { Play, Square, Clock, User, FileSpreadsheet, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeEntry } from "@/types/timeEntry";
import { cn } from "@/lib/utils";

const TASKS = [
  "Processing",
  "Auditing",
  "Meeting",
  "Training",
  "Break",
  "Reports",
  "Idle",
  "Other Activities",
 
];

const TEAMS = [
  "Flex Comp",
  "LOA",
  "COBRA",
  "Benefits Support",
  "Terminations",
 
];

interface TimeTrackerProps {
  onTimeEntryComplete: (entry: TimeEntry) => void;
}

export const TimeTracker = ({ onTimeEntryComplete }: TimeTrackerProps) => {
  const [userName, setUserName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [subTask, setSubTask] = useState("");
  const [assignedVolume, setAssignedVolume] = useState<number | "">("");
  const [processedVolume, setProcessedVolume] = useState<number | "">("");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleStart = () => {
    if (!userName.trim() || !selectedTask) return;
    setIsRunning(true);
    setStartTime(new Date());
    setElapsedTime(0);
  };

  const handleStop = () => {
    if (!isRunning || !startTime) return;

    const endTime = new Date();
    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      userName: userName.trim(),
      teamName: selectedTeam || undefined,
      task: selectedTask,
      subTask: subTask.trim() || undefined,
      assignedVolume: assignedVolume === "" ? undefined : Number(assignedVolume),
      processedVolume: processedVolume === "" ? undefined : Number(processedVolume),
      remainingDeficit: assignedVolume !== "" && processedVolume !== "" 
        ? Number(assignedVolume) - Number(processedVolume)
        : undefined,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: elapsedTime,
      formattedDuration: formatTime(elapsedTime),
    };

    onTimeEntryComplete(entry);
    setIsRunning(false);
    setElapsedTime(0);
    setStartTime(null);
  };

  const canStart = userName.trim() && selectedTask && !isRunning;
  const canStop = isRunning;

  return (
    <Card className="w-full max-w-lg shadow-[var(--shadow-card)] border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <Clock className="w-5 h-5 text-primary" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="flex flex-col items-center py-8">
          <div
            className={cn(
              "timer-display text-6xl font-bold tracking-tight transition-colors duration-300",
              isRunning ? "text-accent" : "text-muted-foreground"
            )}
          >
            {formatTime(elapsedTime)}
          </div>
          {isRunning && (
            <div className="flex items-center gap-2 mt-3">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
              <span className="text-sm text-muted-foreground">Recording</span>
            </div>
          )}
        </div>

        {/* User Name Input */}
        <div className="space-y-2">
          <Label htmlFor="userName" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Your Name
          </Label>
          <Input
            id="userName"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={isRunning}
            className="h-11"
          />
        </div>

        {/* Team Selection */}
        <div className="space-y-2">
          <Label htmlFor="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Select Team
          </Label>
          <Select
            value={selectedTeam}
            onValueChange={setSelectedTeam}
            disabled={isRunning}
          >
            <SelectTrigger className="h-11 bg-card">
              <SelectValue placeholder="Choose a team" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-50">
              {TEAMS.map((team) => (
                <SelectItem key={team} value={team}>
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Task Selection */}
        <div className="space-y-2">
          <Label htmlFor="task" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Select Task
          </Label>
          <Select
            value={selectedTask}
            onValueChange={setSelectedTask}
            disabled={isRunning}
          >
            <SelectTrigger className="h-11 bg-card">
              <SelectValue placeholder="Choose a task" />
            </SelectTrigger>
            <SelectContent className="bg-card border shadow-lg z-50">
              {TASKS.map((task) => (
                <SelectItem key={task} value={task}>
                  {task}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sub Task Input */}
        <div className="space-y-2">
          <Label htmlFor="subTask" className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4" />
            Sub Task
          </Label>
          <Input
            id="subTask"
            placeholder="Enter sub task (optional)"
            value={subTask}
            onChange={(e) => setSubTask(e.target.value)}
            disabled={isRunning}
            className="h-11"
          />
        </div>

        {/* Volume Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assignedVolume">Assigned Volume</Label>
            <Input
              id="assignedVolume"
              type="number"
              placeholder="0"
              value={assignedVolume}
              onChange={(e) => setAssignedVolume(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isRunning}
              className="h-11"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="processedVolume">Processed Volume</Label>
            <Input
              id="processedVolume"
              type="number"
              placeholder="0"
              value={processedVolume}
              onChange={(e) => setProcessedVolume(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={isRunning}
              className="h-11"
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remainingDeficit">Remaining/Deficit</Label>
            <Input
              id="remainingDeficit"
              type="number"
              placeholder="0"
              value={
                assignedVolume !== "" && processedVolume !== ""
                  ? Number(assignedVolume) - Number(processedVolume)
                  : ""
              }
              disabled
              className="h-11 bg-muted"
            />
          </div>
        </div>

   

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleStart}
            disabled={!canStart}
            className="flex-1 h-12 text-base font-medium shadow-[var(--shadow-button)] hover:shadow-lg transition-all"
          >
            <Play className="w-5 h-5 mr-2" />
            Start
          </Button>
          <Button
            onClick={handleStop}
            disabled={!canStop}
            variant="destructive"
            className="flex-1 h-12 text-base font-medium transition-all"
          >
            <Square className="w-5 h-5 mr-2" />
            Stop
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
