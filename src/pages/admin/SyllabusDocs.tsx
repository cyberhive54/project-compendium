import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function SyllabusDocs() {
    return (
        <div className="space-y-8 p-4 md:p-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Syllabus Import Documentation</h1>
                <p className="text-muted-foreground mt-2">
                    Comprehensive guide for structuring your JSON files to bulk import study goals, subjects, and topics.
                </p>
            </div>

            {/* 1. Overview */}
            <Card>
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>
                        The Syllabus Import feature allows you to create an entire study hierarchy in one go. You upload a JSON file representing your curriculum, and the system automatically creates the Goal, Streams, Subjects, Chapters, and Topics based on your structure.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Strict Hierarchy</AlertTitle>
                        <AlertDescription>
                            Your JSON must follow the strict hierarchy:
                            <span className="font-semibold text-primary block mt-1">
                                Goal &rarr; [Streams] &rarr; Subjects &rarr; Chapters &rarr; Topics
                            </span>
                        </AlertDescription>
                    </Alert>
                    <p className="text-sm text-muted-foreground">
                        *Note: Streams are optional. If your goal doesn't use streams (e.g., a simple certification), you can define `subjects` directly under the Goal.
                    </p>
                </CardContent>
            </Card>

            {/* 2. Validation Rules */}
            <Card>
                <CardHeader>
                    <CardTitle>Validation Rules</CardTitle>
                    <CardDescription>
                        The system enforces several rules to ensure data integrity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 text-sm space-y-2">
                        <li><span className="font-semibold">Mandatory Fields:</span> Names are required for every entity (Goal, Subject, etc.).</li>
                        <li><span className="font-semibold">Weightage Logic:</span> To calculate study progress accurately, you can assign `weightage` (0-100) to items.
                            <ul className="list-[circle] pl-5 mt-1 text-muted-foreground">
                                <li>The sum of weightages at any level (Streams, Subjects, Chapters, Topics) <strong>must not exceed 100%</strong>.</li>
                                <li>It is acceptable for the total to be less than 100% (e.g., if you plan to add more items later).</li>
                            </ul>
                        </li>
                        <li><span className="font-semibold">Dates:</span> A Goal must have a `start_date` and `end_date`. If missing in JSON, you will be prompted to enter them.</li>
                    </ul>
                </CardContent>
            </Card>

            {/* 3. Field Dictionary */}
            <Card>
                <CardHeader>
                    <CardTitle>Field Dictionary</CardTitle>
                    <CardDescription>Reference for all available JSON properties.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">

                    {/* Goal */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="outline">Root</Badge> Goal Object
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono">name</TableCell>
                                    <TableCell>String</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>Name of the goal (e.g., "JEE 2026")</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">description</TableCell>
                                    <TableCell>String</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>Optional details about the goal.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">start_date</TableCell>
                                    <TableCell>Date (ISO)</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>YYYY-MM-DD format.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">end_date</TableCell>
                                    <TableCell>Date (ISO)</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>YYYY-MM-DD format.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">streams</TableCell>
                                    <TableCell>Array&lt;Stream&gt;</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>List of streams (e.g., Class 11, Class 12).</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Stream */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="outline">Child</Badge> Stream Object
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono">name</TableCell>
                                    <TableCell>String</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>e.g., "Class 11 Science"</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">weightage</TableCell>
                                    <TableCell>Number</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>percentage contribution to Goal progress (0-100).</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">subjects</TableCell>
                                    <TableCell>Array&lt;Subject&gt;</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>List of subjects in this stream.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Subject */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="outline">Child</Badge> Subject Object
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono">name</TableCell>
                                    <TableCell>String</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>e.g., "Physics"</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">icon</TableCell>
                                    <TableCell>String (Emoji)</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>e.g., "⚛️"</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">color</TableCell>
                                    <TableCell>String (Hex)</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>e.g., "#EF4444"</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">chapters</TableCell>
                                    <TableCell>Array&lt;Chapter&gt;</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>List of chapters.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Chapter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="outline">Child</Badge> Chapter Object
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono">name</TableCell>
                                    <TableCell>String</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>e.g., "Kinematics"</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">topics</TableCell>
                                    <TableCell>Array&lt;Topic&gt;</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>List of topics.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Topic */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Badge variant="outline">Child</Badge> Topic Object
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Field</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead>Description</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono">name</TableCell>
                                    <TableCell>String</TableCell>
                                    <TableCell><Check /></TableCell>
                                    <TableCell>e.g., "Projectile Motion"</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-mono">difficulty</TableCell>
                                    <TableCell>String</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell>"easy", "medium", or "hard" (default: medium)</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                </CardContent>
            </Card>

            {/* 4. Complete Example */}
            <Card>
                <CardHeader>
                    <CardTitle>Example JSON</CardTitle>
                    <CardDescription>
                        Copy this structure to start your syllabus file.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/50 font-mono text-xs">
                        <pre>{JSON.stringify(exampleData, null, 2)}</pre>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}

function Check() {
    return <span className="text-green-600 font-bold">Yes</span>;
}

const exampleData = {
    "name": "NEET 2026 Preparation",
    "description": "Comprehensive study plan for medical entrance.",
    "start_date": "2024-04-01",
    "end_date": "2026-05-01",
    "streams": [
        {
            "name": "Class 11",
            "weightage": 50,
            "subjects": [
                {
                    "name": "Physics",
                    "icon": "⚡",
                    "color": "#3B82F6",
                    "weightage": 33.3,
                    "chapters": [
                        {
                            "name": "Units and Measurements",
                            "weightage": 5,
                            "topics": [
                                { "name": "SI Units", "difficulty": "easy", "weightage": 50 },
                                { "name": "Dimensional Analysis", "difficulty": "medium", "weightage": 50 }
                            ]
                        },
                        {
                            "name": "Kinematics",
                            "weightage": 15,
                            "topics": [
                                { "name": "Rectilinear Motion", "difficulty": "medium", "weightage": 40 },
                                { "name": "Relative Velocity", "difficulty": "hard", "weightage": 60 }
                            ]
                        }
                    ]
                },
                {
                    "name": "Biology",
                    "icon": "🧬",
                    "color": "#10B981",
                    "weightage": 33.3,
                    "chapters": []
                }
            ]
        },
        {
            "name": "Class 12",
            "weightage": 50,
            "subjects": []
        }
    ]
};
