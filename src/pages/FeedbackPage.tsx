import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useFeedback } from "@/hooks/useFeedback";
import { GeneralFeedbackForm } from "@/components/feedback/GeneralFeedbackForm";
import { FeatureRequestForm } from "@/components/feedback/FeatureRequestForm";
import { BugReportForm } from "@/components/feedback/BugReportForm";
import { FeedbackList } from "@/components/feedback/FeedbackList";
import { MessageSquare, Lightbulb, Bug } from "lucide-react";

export default function FeedbackPage() {
    const [activeTab, setActiveTab] = useState("feedback");
    const { submitFeedback, userFeedback, userVotes, voteFeedback } = useFeedback();

    const handleSubmit = (data: any) => {
        submitFeedback.mutate(data);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Feedback & Support</h1>
                <p className="text-muted-foreground">
                    Help us improve by sharing your feedback, requesting features, or reporting bugs
                </p>
            </div>

            {/* Tabbed Interface */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="feedback" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">General Feedback</span>
                        <span className="sm:hidden">Feedback</span>
                    </TabsTrigger>
                    <TabsTrigger value="feature" className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        <span className="hidden sm:inline">Feature Request</span>
                        <span className="sm:hidden">Feature</span>
                    </TabsTrigger>
                    <TabsTrigger value="bug" className="flex items-center gap-2">
                        <Bug className="h-4 w-4" />
                        <span className="hidden sm:inline">Bug Report</span>
                        <span className="sm:hidden">Bug</span>
                    </TabsTrigger>
                </TabsList>

                {/* General Feedback Tab */}
                <TabsContent value="feedback" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                Share Your Thoughts
                            </CardTitle>
                            <CardDescription>
                                Tell us what you think about the app, suggest improvements, or share your experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GeneralFeedbackForm
                                onSubmit={handleSubmit}
                                isSubmitting={submitFeedback.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Feature Request Tab */}
                <TabsContent value="feature" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5" />
                                Request a Feature
                            </CardTitle>
                            <CardDescription>
                                Have an idea? Tell us what feature would make your experience better
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FeatureRequestForm
                                onSubmit={handleSubmit}
                                isSubmitting={submitFeedback.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bug Report Tab */}
                <TabsContent value="bug" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bug className="h-5 w-5" />
                                Report a Bug
                            </CardTitle>
                            <CardDescription>
                                Found something broken? Help us fix it by providing detailed information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BugReportForm
                                onSubmit={handleSubmit}
                                isSubmitting={submitFeedback.isPending}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* My Submissions Section */}
            <div className="space-y-4">
                <Separator />
                <div>
                    <h2 className="text-2xl font-semibold mb-2">My Submissions</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Track the status of your feedback, feature requests, and bug reports
                    </p>
                </div>

                {userFeedback.isLoading ? (
                    <div className="text-center py-12 text-muted-foreground">
                        Loading your submissions...
                    </div>
                ) : userFeedback.data && userFeedback.data.length > 0 ? (
                    <FeedbackList
                        feedbacks={userFeedback.data}
                        userVotes={userVotes.data || []}
                        onVote={(id) => voteFeedback.mutate(id)}
                        showActions={false}
                    />
                ) : (
                    <Card>
                        <CardContent className="py-12">
                            <div className="text-center text-muted-foreground">
                                <p>You haven't submitted any feedback yet.</p>
                                <p className="text-sm mt-2">
                                    Use the tabs above to share your thoughts!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
