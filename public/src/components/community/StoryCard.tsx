import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Trash2, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useStoryComments, SuccessStory } from "@/hooks/useSuccessStories";
import { cn } from "@/lib/utils";

interface StoryCardProps {
  story: SuccessStory;
  onLike: (storyId: string) => void;
  onDelete: (storyId: string) => void;
}

export function StoryCard({ story, onLike, onDelete }: StoryCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { comments, loading: commentsLoading, addComment, deleteComment, refetch } = useStoryComments(story.id);

  const handleLike = () => {
    if (!user) return;
    onLike(story.id);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const toggleComments = () => {
    setShowComments(!showComments);
    if (!showComments) {
      refetch();
    }
  };

  return (
    <article className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full gradient-royal flex items-center justify-center">
            {story.user_profile?.avatar_url ? (
              <img
                src={story.user_profile.avatar_url}
                alt=""
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              {story.user_profile?.display_name || "Anonymous"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
            </p>
          </div>
          {user?.id === story.user_id && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(story.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2">{story.title}</h3>
        <p className="text-muted-foreground whitespace-pre-wrap">{story.content}</p>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 border-t border-border flex items-center gap-4">
        <button
          onClick={handleLike}
          disabled={!user}
          className={cn(
            "flex items-center gap-2 text-sm transition-colors",
            story.user_has_liked
              ? "text-destructive"
              : "text-muted-foreground hover:text-destructive",
            !user && "opacity-50 cursor-not-allowed"
          )}
        >
          <Heart
            className={cn("h-5 w-5", story.user_has_liked && "fill-current")}
          />
          <span>{story.likes_count}</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{story.comments_count}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-border bg-secondary/30">
          {/* Comment Input */}
          {user ? (
            <div className="flex gap-3 mb-4">
              <div className="w-8 h-8 rounded-full gradient-royal flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={1}
                  className="min-h-[40px] resize-none"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  size="icon"
                  variant="hero"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Sign in to leave a comment
            </p>
          )}

          {/* Comments List */}
          {commentsLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {comment.user_profile?.avatar_url ? (
                      <img
                        src={comment.user_profile.avatar_url}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-card rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {comment.user_profile?.display_name || "Anonymous"}
                        </p>
                        {user?.id === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-1">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
