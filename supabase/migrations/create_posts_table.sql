-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  heading TEXT NOT NULL,
  caption TEXT NOT NULL,
  hookline TEXT NOT NULL,
  cta TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}',
  social TEXT[] DEFAULT '{}',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'posted')),
  comment TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_posts_user_id 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- Create index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- Add comment to table
COMMENT ON TABLE posts IS 'Table storing social media posts with AI-generated content';
COMMENT ON COLUMN posts.heading IS 'AI-generated heading for the post';
COMMENT ON COLUMN posts.caption IS 'AI-generated caption for the post';
COMMENT ON COLUMN posts.hookline IS 'AI-generated hookline for the post';
COMMENT ON COLUMN posts.cta IS 'AI-generated call-to-action for the post';
COMMENT ON COLUMN posts.hashtags IS 'Array of AI-generated hashtags';
COMMENT ON COLUMN posts.social IS 'Array of social media platforms to post to';
COMMENT ON COLUMN posts.status IS 'Post lifecycle status: draft, pending, approved, rejected, posted';
COMMENT ON COLUMN posts.comment IS 'Comment for user disapproval or feedback';
COMMENT ON COLUMN posts.posted_at IS 'Timestamp when the post was actually posted to social media';


