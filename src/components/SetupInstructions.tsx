import React, { useState } from 'react';
import { Database, ExternalLink, Copy, Check, AlertTriangle, X } from 'lucide-react';

interface SetupInstructionsProps {
  onClose: () => void;
}

const SetupInstructions: React.FC<SetupInstructionsProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const migrationSQL = `-- Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  username text NOT NULL,
  user_avatar text DEFAULT '',
  content text NOT NULL,
  image_url text,
  link_url text,
  link_title text,
  category text NOT NULL DEFAULT 'discussion',
  likes integer DEFAULT 0,
  dislikes integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view approved posts"
  ON community_posts
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create posts"
  ON community_posts
  FOR INSERT
  WITH CHECK (true);`;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-400" />
              <h2 className="text-white text-2xl font-bold">Setup Real-time Community</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Demo Mode Active</span>
              </div>
              <p className="text-yellow-300 text-sm">
                The community is currently running in demo mode. To enable real-time features for all users, 
                please set up Supabase following the instructions below.
              </p>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-3">Step 1: Create Supabase Project</h3>
              <ol className="text-gray-300 space-y-2 text-sm">
                <li>1. Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">supabase.com</a> and create a new project</li>
                <li>2. Wait for the project to be fully set up</li>
                <li>3. Go to Settings → API to get your project URL and anon key</li>
              </ol>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-3">Step 2: Update Environment Variables</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Add to your .env file:</span>
                  <button
                    onClick={() => copyToClipboard(`VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key`)}
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-green-400 text-sm">
{`VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-3">Step 3: Run Database Migration</h3>
              <p className="text-gray-300 text-sm mb-3">
                Go to your Supabase project → SQL Editor and run this migration:
              </p>
              <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Migration SQL:</span>
                  <button
                    onClick={() => copyToClipboard(migrationSQL)}
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-green-400 text-xs">
                  {migrationSQL}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-3">Step 4: Deploy & Test</h3>
              <ol className="text-gray-300 space-y-2 text-sm">
                <li>1. Restart your development server</li>
                <li>2. Test creating posts and comments</li>
                <li>3. Verify real-time updates work across multiple browser tabs</li>
                <li>4. Deploy to production with the same environment variables</li>
              </ol>
            </div>

            <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">Features Enabled:</h4>
              <ul className="text-blue-300 text-sm space-y-1">
                <li>• Real-time posts and comments visible to all users</li>
                <li>• Admin approval system for content moderation</li>
                <li>• Like/dislike reactions with live updates</li>
                <li>• Content reporting system</li>
                <li>• Persistent data storage</li>
                <li>• Password-protected user accounts</li>
              </ul>
            </div>

            <div className="bg-green-600/20 border border-green-600 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">Admin Access:</h4>
              <p className="text-green-300 text-sm">
                Create an account with username "admin" or "moderator" to access the admin panel. 
                Admin users can approve/reject posts, manage reports, and moderate the community.
              </p>
            </div>

            <div className="flex space-x-3">
              <a
                href="https://supabase.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Supabase Docs</span>
              </a>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Reload App
              </button>
              <button
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupInstructions;