import { EXAM_TASK_TYPES } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExamFieldsProps {
  taskType: string;
  values: {
    total_questions?: number | null;
    attempted_questions?: number | null;
    correct_answers?: number | null;
    wrong_answers?: number | null;
    marks_per_question?: number | null;
    negative_marking?: number | null;
    time_taken_minutes?: number | null;
    marks_obtained?: number | null;
  };
  onChange: (field: string, value: number | null) => void;
}

export function ExamFields({ taskType, values, onChange }: ExamFieldsProps) {
  if (!EXAM_TASK_TYPES.includes(taskType)) return null;

  const total = values.total_questions ?? 0;
  const attempted = values.attempted_questions ?? 0;
  const correct = values.correct_answers ?? 0;
  const wrong = values.wrong_answers ?? 0;
  const skipped = total - attempted;
  const marksPerQ = values.marks_per_question ?? 0;
  const negMarking = values.negative_marking ?? 0;
  const totalMarks = total * marksPerQ;
  const marksObtained = correct * marksPerQ - wrong * negMarking;
  const accuracy = attempted > 0 ? ((correct / attempted) * 100) : 0;
  const speed = (values.time_taken_minutes ?? 0) > 0 ? (attempted / (values.time_taken_minutes ?? 1)) : 0;

  const parseNum = (v: string) => {
    const n = parseInt(v);
    return isNaN(n) ? null : n;
  };

  const parseFloat2 = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };

  return (
    <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
      <h4 className="text-sm font-medium">Exam Details</h4>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Total Questions</Label>
          <Input
            type="number"
            min={0}
            value={values.total_questions ?? ""}
            onChange={(e) => onChange("total_questions", parseNum(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Attempted</Label>
          <Input
            type="number"
            min={0}
            max={total}
            value={values.attempted_questions ?? ""}
            onChange={(e) => onChange("attempted_questions", parseNum(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Correct</Label>
          <Input
            type="number"
            min={0}
            max={attempted}
            value={values.correct_answers ?? ""}
            onChange={(e) => onChange("correct_answers", parseNum(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Wrong</Label>
          <Input
            type="number"
            min={0}
            max={attempted}
            value={values.wrong_answers ?? ""}
            onChange={(e) => onChange("wrong_answers", parseNum(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Marks/Question</Label>
          <Input
            type="number"
            min={0}
            step="0.5"
            value={values.marks_per_question ?? ""}
            onChange={(e) => onChange("marks_per_question", parseFloat2(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Negative Marking</Label>
          <Input
            type="number"
            min={0}
            step="0.25"
            value={values.negative_marking ?? ""}
            onChange={(e) => onChange("negative_marking", parseFloat2(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Time Taken (min)</Label>
          <Input
            type="number"
            min={0}
            value={values.time_taken_minutes ?? ""}
            onChange={(e) => onChange("time_taken_minutes", parseNum(e.target.value))}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Marks Obtained</Label>
          <Input
            type="number"
            step="0.5"
            value={values.marks_obtained ?? ""}
            onChange={(e) => onChange("marks_obtained", parseFloat2(e.target.value))}
          />
        </div>
      </div>

      {/* Auto-calculated summary */}
      {total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Skipped</p>
            <p className="text-sm font-medium">{skipped}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Marks</p>
            <p className="text-sm font-medium">{totalMarks.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Accuracy</p>
            <p className="text-sm font-medium">{accuracy.toFixed(1)}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Speed</p>
            <p className="text-sm font-medium">{speed.toFixed(2)} Q/min</p>
          </div>
        </div>
      )}
    </div>
  );
}
