-- User Guessing Game Database Schema
-- This file contains the SQL commands to set up the database schema for the User Guessing Game

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL, -- Combined description from all questions and additional info
    gemini_api_key TEXT NOT NULL, -- Will be encrypted in application layer
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create game_results table (simplified - stores who guessed whom)
CREATE TABLE IF NOT EXISTS game_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guesser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    correct_guess BOOLEAN NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 1,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT no_self_guessing CHECK (guesser_id != assigned_user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_guesser_id ON game_results(guesser_id);
CREATE INDEX IF NOT EXISTS idx_game_results_assigned_user_id ON game_results(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Game results policies
CREATE POLICY "Users can view their game results" ON game_results
    FOR SELECT USING (auth.uid() = guesser_id OR auth.uid() = assigned_user_id);

CREATE POLICY "Users can create their own game results" ON game_results
    FOR INSERT WITH CHECK (auth.uid() = guesser_id);

CREATE POLICY "Users can update their own game results" ON game_results
    FOR UPDATE USING (auth.uid() = guesser_id);

-- Helper functions for the application

-- Function to get a random user for assignment (excluding self and recently assigned)
CREATE OR REPLACE FUNCTION get_random_user_for_assignment(guesser_user_id UUID)
RETURNS UUID AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- First try to get a user that hasn't been assigned to this guesser before
    SELECT p.user_id INTO target_user_id
    FROM profiles p
    WHERE p.user_id != guesser_user_id
    AND p.user_id NOT IN (
        SELECT gr.assigned_user_id 
        FROM game_results gr 
        WHERE gr.guesser_id = guesser_user_id
    )
    ORDER BY RANDOM()
    LIMIT 1;
    
    -- If no new users available, get the least recently assigned user
    IF target_user_id IS NULL THEN
        SELECT gr.assigned_user_id INTO target_user_id
        FROM game_results gr
        JOIN profiles p ON gr.assigned_user_id = p.user_id
        WHERE gr.guesser_id = guesser_user_id
        ORDER BY gr.created_at ASC
        LIMIT 1;
    END IF;
    
    RETURN target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update points for both users after a successful guess
CREATE OR REPLACE FUNCTION award_points_for_correct_guess(guesser_user_id UUID, assigned_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Award points to both users
    UPDATE profiles SET points = points + 1 WHERE user_id = guesser_user_id;
    UPDATE profiles SET points = points + 1 WHERE user_id = assigned_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;