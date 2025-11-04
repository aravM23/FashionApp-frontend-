-- SQL script to set up the outfits table in Supabase
-- Run this in your Supabase SQL Editor

-- Create outfits table to store uploaded outfit data
CREATE TABLE IF NOT EXISTS outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analyzed BOOLEAN DEFAULT FALSE,
    style_profile VARCHAR(100),
    colors TEXT[],
    occasions TEXT[],
    suggestions TEXT[],
    user_id UUID, -- Optional: link to user authentication
    metadata JSONB, -- Store additional data as needed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_outfits_uploaded_at ON outfits(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfits_analyzed ON outfits(analyzed);

-- Enable Row Level Security (RLS)
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own outfits
CREATE POLICY "Users can insert their own outfits" ON outfits
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own outfits
CREATE POLICY "Users can view their own outfits" ON outfits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to update their own outfits
CREATE POLICY "Users can update their own outfits" ON outfits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own outfits
CREATE POLICY "Users can delete their own outfits" ON outfits
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create storage bucket for outfit images (if not exists)
-- This needs to be done via Supabase Dashboard > Storage
-- Bucket name: wardrobe-assets
-- Public: false (for privacy)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Create function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update 'updated_at'
CREATE TRIGGER update_outfits_updated_at
    BEFORE UPDATE ON outfits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE outfits IS 'Stores user uploaded outfit photos and AI analysis data for personalized fashion recommendations';
