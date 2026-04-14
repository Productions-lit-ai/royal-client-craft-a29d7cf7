import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface SuccessStory {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
  user_has_liked?: boolean;
}

export interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function useSuccessStories() {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStories = async () => {
    setLoading(true);
    
    const { data: storiesData, error } = await supabase
      .from("success_stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stories:", error);
      setLoading(false);
      return;
    }

    // Fetch profiles for all stories
    const userIds = [...new Set(storiesData.map(s => s.user_id))];
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    // Fetch user's likes if logged in
    let userLikes: string[] = [];
    if (user) {
      const { data: likesData } = await supabase
        .from("story_likes")
        .select("story_id")
        .eq("user_id", user.id);
      userLikes = likesData?.map(l => l.story_id) || [];
    }

    const storiesWithProfiles = storiesData.map(story => ({
      ...story,
      user_profile: profiles?.find(p => p.user_id === story.user_id) || null,
      user_has_liked: userLikes.includes(story.id),
    }));

    setStories(storiesWithProfiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  const createStory = async (title: string, content: string) => {
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
      .from("success_stories")
      .insert({ user_id: user.id, title, content });

    if (error) throw error;
    await fetchStories();
  };

  const toggleLike = async (storyId: string) => {
    if (!user) throw new Error("Must be logged in");

    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    if (story.user_has_liked) {
      await supabase
        .from("story_likes")
        .delete()
        .eq("story_id", storyId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("story_likes")
        .insert({ story_id: storyId, user_id: user.id });
    }

    await fetchStories();
  };

  const deleteStory = async (storyId: string) => {
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
      .from("success_stories")
      .delete()
      .eq("id", storyId)
      .eq("user_id", user.id);

    if (error) throw error;
    await fetchStories();
  };

  return { stories, loading, createStory, toggleLike, deleteStory, refetch: fetchStories };
}

export function useStoryComments(storyId: string) {
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchComments = async () => {
    setLoading(true);
    
    const { data: commentsData, error } = await supabase
      .from("story_comments")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
      setLoading(false);
      return;
    }

    // Fetch profiles
    const userIds = [...new Set(commentsData.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", userIds);

    const commentsWithProfiles = commentsData.map(comment => ({
      ...comment,
      user_profile: profiles?.find(p => p.user_id === comment.user_id) || null,
    }));

    setComments(commentsWithProfiles);
    setLoading(false);
  };

  useEffect(() => {
    if (storyId) {
      fetchComments();
    }
  }, [storyId]);

  const addComment = async (content: string) => {
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
      .from("story_comments")
      .insert({ story_id: storyId, user_id: user.id, content });

    if (error) throw error;
    await fetchComments();
  };

  const deleteComment = async (commentId: string) => {
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
      .from("story_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", user.id);

    if (error) throw error;
    await fetchComments();
  };

  return { comments, loading, addComment, deleteComment, refetch: fetchComments };
}
