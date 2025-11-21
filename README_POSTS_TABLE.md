# Posts Table Setup

This document describes the `posts` table structure for the n8n_social_media project.

## Table Schema

### Table: `posts`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Auto-generated unique identifier |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → users(id) | Reference to the user who created the post |
| `heading` | TEXT | NOT NULL | AI-generated heading |
| `caption` | TEXT | NOT NULL | AI-generated caption |
| `hookline` | TEXT | NOT NULL | AI-generated hookline |
| `cta` | TEXT | NOT NULL | AI-generated call-to-action |
| `hashtags` | TEXT[] | DEFAULT '{}' | Array of AI-generated hashtags |
| `social` | TEXT[] | DEFAULT '{}' | Array of social media platforms to post to |
| `image_url` | TEXT | NULLABLE | Image URL added by admin |
| `status` | TEXT | NOT NULL, DEFAULT 'draft', CHECK constraint | Post lifecycle status |
| `comment` | TEXT | NULLABLE | Comment for user disapproval or feedback |
| `posted_at` | TIMESTAMPTZ | NULLABLE | Timestamp when post was actually posted |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Timestamp when post was created |

### Status Values

The `status` column accepts the following values:
- `draft` - Post is being created/edited (default)
- `pending` - Post is submitted for approval
- `approved` - Post has been approved
- `rejected` - Post has been rejected
- `posted` - Post has been published to social media

### Foreign Key Constraint

- `user_id` references `users(id)` with `ON DELETE CASCADE`
  - If a user is deleted, all their posts are automatically deleted

### Indexes

The following indexes are created for performance:
- `idx_posts_user_id` - On `user_id` for user-based queries
- `idx_posts_status` - On `status` for filtering by status
- `idx_posts_created_at` - On `created_at DESC` for chronological sorting

## How to Apply

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/create_posts_table.sql`
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db push
```

Or manually:

```bash
supabase migration new create_posts_table
# Then copy the SQL content to the generated migration file
supabase db reset
```

### Option 3: Direct SQL Execution

Run the SQL file directly in your Supabase SQL Editor.

## Example Queries

### Create a new post
```sql
INSERT INTO posts (user_id, heading, caption, hookline, cta, hashtags, social)
VALUES (
  'user-uuid-here',
  'Amazing Product Launch',
  'Check out our new product...',
  'Don''t miss out!',
  'Buy now',
  ARRAY['#product', '#launch', '#new'],
  ARRAY['twitter', 'facebook', 'instagram']
);
```

### Get all posts for a user
```sql
SELECT * FROM posts WHERE user_id = 'user-uuid-here' ORDER BY created_at DESC;
```

### Get posts by status
```sql
SELECT * FROM posts WHERE status = 'pending' ORDER BY created_at DESC;
```

### Update post status
```sql
UPDATE posts 
SET status = 'approved', comment = NULL 
WHERE id = 'post-uuid-here';
```

### Mark post as posted
```sql
UPDATE posts 
SET status = 'posted', posted_at = NOW() 
WHERE id = 'post-uuid-here';
```


