import { useState } from "react";
import { Link } from "react-router-dom";
import { PenSquare, Loader2, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSuccessStories } from "@/hooks/useSuccessStories";
import { StoryCard } from "@/components/community/StoryCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Community() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const { user } = useAuth();
  const { stories, loading, createStory, toggleLike, deleteStory } = useSuccessStories();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await createStory(title.trim(), content.trim());
      setTitle("");
      setContent("");
      setIsDialogOpen(false);
      toast({
        title: "Story shared!",
        description: "Your success story has been posted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (storyId: string) => {
    try {
      await toggleLike(storyId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Please sign in to like stories.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (storyId: string) => {
    try {
      await deleteStory(storyId);
      toast({
        title: "Deleted",
        description: "Your story has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete story.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* SEO */}
      <title>Community | LIT Productions - Success Stories</title>
      <meta
        name="description"
        content="Join the LIT Productions community. Share your success stories and connect with fellow members."
      />

      {/* Hero Section */}
      <section className="gradient-royal py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="animate-fade-in text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Community <span className="text-gradient-gold">Hub</span>
          </h1>
          <p className="animate-fade-in-delay text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Share your success stories and celebrate with fellow community members. 
            Your journey inspires others!
          </p>
          
          {user ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gold" size="lg" className="animate-fade-in-delay-2">
                  <PenSquare className="h-5 w-5 mr-2" />
                  Share Your Story
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Share Your Success Story
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your story a title..."
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Your Story</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your success story with the community..."
                      rows={6}
                      maxLength={2000}
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="hero"
                    className="w-full"
                    disabled={!title.trim() || !content.trim() || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      "Post Story"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button asChild variant="gold" size="lg" className="animate-fade-in-delay-2">
              <Link to="/auth?mode=signup">
                Join to Share Your Story
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Stories Feed */}
      <section className="py-12 px-6 bg-background min-h-[50vh]">
        <div className="max-w-2xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No stories yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your success story with the community!
              </p>
              {!user && (
                <Button asChild variant="hero">
                  <Link to="/auth?mode=signup">Sign Up to Post</Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
