import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";
import type { Subject, Chapter, Topic } from "@/types/database";

/**
 * Hook to fetch ALL subjects across all goals for the current user
 * Used for advanced hierarchy selection where we need the full dataset
 */
export function useAllSubjects() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["all-subjects", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data, error } = await supabase
                .from("subjects")
                .select("*, goal:goals!inner(user_id)")
                .eq("goal.user_id", user.id)
                .eq("archived", false)
                .order("name");

            if (error) throw error;
            return (data as Subject[]) || [];
        },
        enabled: !!user?.id,
    });
}

/**
 * Hook to fetch ALL chapters across all subjects for the current user
 */
export function useAllChapters() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["all-chapters", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data, error } = await supabase
                .from("chapters")
                .select("*, subject:subjects!inner(goal:goals!inner(user_id))")
                .eq("subject.goal.user_id", user.id)
                .eq("archived", false)
                .order("chapter_number");

            if (error) throw error;
            return (data as Chapter[]) || [];
        },
        enabled: !!user?.id,
    });
}

/**
 * Hook to fetch ALL topics across all chapters for the current user
 */
export function useAllTopics() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ["all-topics", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];

            const { data, error } = await supabase
                .from("topics")
                .select("*, chapter:chapters!inner(subject:subjects!inner(goal:goals!inner(user_id)))")
                .eq("chapter.subject.goal.user_id", user.id)
                .eq("archived", false)
                .order("name");

            if (error) throw error;
            return (data as Topic[]) || [];
        },
        enabled: !!user?.id,
    });
}

/**
 * Comprehensive hook that provides all hierarchy data and helper functions
 * for smart bidirectional selection in task forms
 */
export function useAllHierarchy() {
    const { data: subjects = [] } = useAllSubjects();
    const { data: chapters = [] } = useAllChapters();
    const { data: topics = [] } = useAllTopics();

    // Helper: Find subject by ID
    const findSubject = (subjectId: string | null) => {
        if (!subjectId) return null;
        return subjects.find((s) => s.subject_id === subjectId) || null;
    };

    // Helper: Find chapter by ID
    const findChapter = (chapterId: string | null) => {
        if (!chapterId) return null;
        return chapters.find((c) => c.chapter_id === chapterId) || null;
    };

    // Helper: Find topic by ID
    const findTopic = (topicId: string | null) => {
        if (!topicId) return null;
        return topics.find((t) => t.topic_id === topicId) || null;
    };

    // Helper: Get filtered subjects by goal
    const getSubjectsByGoal = (goalId: string | null) => {
        if (!goalId) return subjects;
        return subjects.filter((s) => s.goal_id === goalId);
    };

    // Helper: Get filtered chapters by subject
    const getChaptersBySubject = (subjectId: string | null) => {
        if (!subjectId) return chapters;
        return chapters.filter((c) => c.subject_id === subjectId);
    };

    // Helper: Get filtered topics by chapter
    const getTopicsByChapter = (chapterId: string | null) => {
        if (!chapterId) return topics;
        return topics.filter((t) => t.chapter_id === chapterId);
    };

    // Helper: Backtrace from topic to get all parents
    const backtraceFromTopic = (topicId: string) => {
        const topic = findTopic(topicId);
        if (!topic) return null;

        const chapter = findChapter(topic.chapter_id);
        if (!chapter) return null;

        const subject = findSubject(chapter.subject_id);
        if (!subject) return null;

        return {
            goalId: subject.goal_id,
            subjectId: subject.subject_id,
            chapterId: chapter.chapter_id,
            topicId: topic.topic_id,
        };
    };

    // Helper: Backtrace from chapter to get parents
    const backtraceFromChapter = (chapterId: string) => {
        const chapter = findChapter(chapterId);
        if (!chapter) return null;

        const subject = findSubject(chapter.subject_id);
        if (!subject) return null;

        return {
            goalId: subject.goal_id,
            subjectId: subject.subject_id,
            chapterId: chapter.chapter_id,
        };
    };

    // Helper: Backtrace from subject to get goal
    const backtraceFromSubject = (subjectId: string) => {
        const subject = findSubject(subjectId);
        if (!subject) return null;

        return {
            goalId: subject.goal_id,
            subjectId: subject.subject_id,
        };
    };

    return {
        subjects,
        chapters,
        topics,
        findSubject,
        findChapter,
        findTopic,
        getSubjectsByGoal,
        getChaptersBySubject,
        getTopicsByChapter,
        backtraceFromTopic,
        backtraceFromChapter,
        backtraceFromSubject,
    };
}
