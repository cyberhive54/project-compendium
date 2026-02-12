import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Code, Trophy, Star, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminBadgesDocs() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/badges">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        Badge System Documentation
                    </h1>
                    <p className="text-muted-foreground">
                        Guide to configuring badges, levels, and unlock conditions.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Basic Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Basic Configuration
                        </CardTitle>
                        <CardDescription>
                            Core fields required for every badge.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">Badge ID</h3>
                                <p className="text-sm text-muted-foreground">
                                    Unique identifier (e.g., <code className="bg-muted px-1 rounded">streak_7</code>). Used internally by the system.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">Name & Description</h3>
                                <p className="text-sm text-muted-foreground">
                                    Publicly visible name and description shown to users.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">Icon</h3>
                                <p className="text-sm text-muted-foreground">
                                    A single emoji character (e.g., 🔥, 🏆, 🎓) representing the badge.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">XP Reward</h3>
                                <p className="text-sm text-muted-foreground">
                                    Experience points awarded immediately upon unlocking this badge.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories & Tiers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5 text-indigo-500" />
                            Categories & Tiers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <h3 className="font-medium">Categories</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Badge variant="outline">streak</Badge> Daily study streaks
                                </li>
                                <li className="flex items-center gap-2">
                                    <Badge variant="outline">time</Badge> Total study hours accumulated
                                </li>
                                <li className="flex items-center gap-2">
                                    <Badge variant="outline">task</Badge> Number of tasks completed
                                </li>
                                <li className="flex items-center gap-2">
                                    <Badge variant="outline">exam</Badge> Exam performance & accuracy
                                </li>
                                <li className="flex items-center gap-2">
                                    <Badge variant="outline">milestone</Badge> One-time achievements
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-medium">Tiers</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                                Visual hierarchy for badges. Higher tiers often have more elaborate styling.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-orange-700 hover:bg-orange-800">Bronze</Badge>
                                <Badge className="bg-slate-400 hover:bg-slate-500">Silver</Badge>
                                <Badge className="bg-yellow-500 hover:bg-yellow-600">Gold</Badge>
                                <Badge className="bg-cyan-500 hover:bg-cyan-600">Platinum</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Levels */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-blue-500" />
                            Multi-Level Badges & Inputs
                        </CardTitle>
                        <CardDescription>
                            Understanding <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Threshold</span> and <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Count/Val</span>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <p className="text-sm text-muted-foreground">
                            Badges can have multiple levels (e.g., Level 1, 2, 3). The system identifies which level a user has reached by comparing their stats against the <strong>Level Configuration</strong>.
                        </p>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4 border rounded p-4 bg-muted/20">
                                <h4 className="font-semibold text-sm">Fields Explained</h4>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">Threshold (≥)</span>
                                        <Badge variant="secondary" className="text-[10px]">Required</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        The <strong>primary criteria</strong> value. The system checks: <br />
                                        <code className="text-primary">User Stat &ge; Threshold</code>
                                    </p>
                                    <ul className="text-xs list-disc pl-4 text-muted-foreground mt-1 space-y-1">
                                        <li>For <strong>Streak</strong> badges: Number of Days.</li>
                                        <li>For <strong>Tasks</strong> badges: Number of Tasks.</li>
                                        <li>For <strong>Time</strong> badges: Number of Hours.</li>
                                        <li>For <strong>Exam</strong> badges: Accuracy Percentage.</li>
                                    </ul>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">Count/Val</span>
                                        <Badge variant="outline" className="text-[10px]">Optional</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        An <strong>auxiliary criteria</strong> value.
                                        Most standard badges <strong>do not use this</strong> (keep at 0).
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        <em>Future Use Case:</em> "Score 90% (Threshold) on 5 separate exams (Count)".
                                    </p>
                                </div>

                                <div className="space-y-1 pt-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">XP Reward</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        The XP given specifically for reaching this level.
                                        <strong>Cumulative Logic:</strong> If Level 1 gives 50XP, and Level 2 gives 150XP, the user receives +100XP when promoting from Level 1 to 2.
                                    </p>
                                </div>
                            </div>

                            <div className="border rounded-md overflow-hidden h-fit">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Level</th>
                                            <th className="px-4 py-2 text-left">Threshold</th>
                                            <th className="px-4 py-2 text-left">Reward</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="px-4 py-2 font-medium">1</td>
                                            <td className="px-4 py-2">10</td>
                                            <td className="px-4 py-2">50 XP</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium">2</td>
                                            <td className="px-4 py-2">50</td>
                                            <td className="px-4 py-2">150 XP</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-2 font-medium">3</td>
                                            <td className="px-4 py-2">100</td>
                                            <td className="px-4 py-2">500 XP</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="p-3 chat-bubble text-xs text-muted-foreground bg-muted/30 italic">
                                    "If I have completed 60 tasks, I pass the Threshold for Level 2 (50), but not Level 3 (100). So I am Level 2."
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Unlock Logic */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Code className="h-5 w-5 text-green-500" />
                            Unlock Logic (JSON)
                        </CardTitle>
                        <CardDescription>
                            Copy these snippets into the "Unlock Condition" field.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">

                            <div className="border rounded-md p-4 bg-muted/10 relative group">
                                <Badge className="absolute top-2 right-2 bg-green-600">Most Common</Badge>
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <span>🔥</span> Streak Badge
                                </h4>
                                <div className="text-xs text-muted-foreground mb-2">
                                    Unlocks when current study streak hits <strong>X days</strong>.
                                </div>
                                <pre className="text-xs bg-slate-950 text-slate-50 p-3 rounded overflow-x-auto select-all">
                                    {`{
  "type": "streak",
  "days": 7
}`}
                                </pre>
                                <p className="text-[10px] text-muted-foreground mt-2">
                                    <strong>Note:</strong> If using Levels, the "days" here refers to the default threshold for Level 1.
                                </p>
                            </div>

                            <div className="border rounded-md p-4 bg-muted/10">
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <span>✅</span> Task Count Badge
                                </h4>
                                <div className="text-xs text-muted-foreground mb-2">
                                    Unlocks when total completed tasks hits <strong>X count</strong>.
                                </div>
                                <pre className="text-xs bg-slate-950 text-slate-50 p-3 rounded overflow-x-auto select-all">
                                    {`{
  "type": "tasks_completed",
  "count": 50
}`}
                                </pre>
                            </div>

                            <div className="border rounded-md p-4 bg-muted/10">
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <span>⏱️</span> Study Time Badge
                                </h4>
                                <div className="text-xs text-muted-foreground mb-2">
                                    Unlocks when total study hours hits <strong>X hours</strong>.
                                </div>
                                <pre className="text-xs bg-slate-950 text-slate-50 p-3 rounded overflow-x-auto select-all">
                                    {`{
  "type": "total_time",
  "hours": 100
}`}
                                </pre>
                            </div>

                            <div className="border rounded-md p-4 bg-muted/10">
                                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                                    <span>🏆</span> Exam Accuracy
                                </h4>
                                <div className="text-xs text-muted-foreground mb-2">
                                    Unlocks when user scores <strong>X%</strong> on any single exam task.
                                </div>
                                <pre className="text-xs bg-slate-950 text-slate-50 p-3 rounded overflow-x-auto select-all">
                                    {`{
  "type": "exam_accuracy",
  "percentage": 90
}`}
                                </pre>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium text-sm mb-3">Milestone Badges (One-Time)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <code className="text-xs bg-muted p-2 rounded block text-center select-all">{`{ "type": "first_goal" }`}</code>
                                <code className="text-xs bg-muted p-2 rounded block text-center select-all">{`{ "type": "first_timer_session" }`}</code>
                                <code className="text-xs bg-muted p-2 rounded block text-center select-all">{`{ "type": "first_exam" }`}</code>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
