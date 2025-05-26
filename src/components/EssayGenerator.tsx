import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EssayChat from './EssayChat';

interface EssayGeneratorProps {
  userProfile: {
    goals: string;
    experience: string;
    achievements: string;
    extracurricular: string;
    socialLinks: Record<string, string>;
  };
  university: {
    name: string;
    id: string;
    strengths?: string[];
    programSpecificInfo?: Record<string, { description: string }>;
  };
  topic: {
    title: string;
    prompt: string;
    wordLimit: number;
  };
  onSave: (essay: string) => void;
}

const EssayGenerator: React.FC<EssayGeneratorProps> = ({ userProfile, university, topic, onSave }) => {
  const [essay, setEssay] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editInstructions, setEditInstructions] = useState('');
  const [showStructure, setShowStructure] = useState(false);
  const [mode, setMode] = useState<'chat' | 'direct'>('chat');

  const generateEssay = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          university,
          profile: userProfile,
          structureOnly: showStructure
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate essay');
      }

      const data = await response.json();
      setEssay(data.essay);
      setWordCount(data.wordCount);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate essay');
    } finally {
      setLoading(false);
    }
  };

  const editEssay = async () => {
    if (!editInstructions.trim()) {
      setError('Please provide editing instructions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/edit-essay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essay,
          instructions: editInstructions,
          topic,
          university,
          profile: userProfile
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit essay');
      }

      const data = await response.json();
      setEssay(data.essay);
      setWordCount(data.wordCount);
      setIsEditing(false);
      setEditInstructions('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to edit essay');
    } finally {
      setLoading(false);
    }
  };

  const handleEssayGenerated = (newEssay: string) => {
    setEssay(newEssay);
    setWordCount(newEssay.split(/\s+/).length);
  };

  const handleSave = () => {
    onSave(essay);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Essay Generator</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMode('chat')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chat Mode
          </button>
          <button
            onClick={() => setMode('direct')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mode === 'direct'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Direct Mode
          </button>
        </div>
      </div>

      {mode === 'chat' ? (
        <EssayChat
          userProfile={userProfile}
          university={university}
          topic={topic}
          onEssayGenerated={handleEssayGenerated}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showStructure}
                  onChange={(e) => setShowStructure(e.target.checked)}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-600">Show Structure Only</span>
              </label>
              <button
                onClick={generateEssay}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Essay'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-600 mb-2">{topic.prompt}</p>
            <div className="flex items-center text-sm text-gray-500">
              <span className={wordCount > topic.wordLimit ? 'text-red-500' : ''}>
                {wordCount} / {topic.wordLimit} words
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {essay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="prose max-w-none">
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap font-sans">{essay}</pre>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={handleSave}
                  className="text-green-600 hover:text-green-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save
                </button>
              </div>

              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <textarea
                    value={editInstructions}
                    onChange={(e) => setEditInstructions(e.target.value)}
                    placeholder="Enter your editing instructions (e.g., 'Make it more personal', 'Add more details about my leadership experience')"
                    className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex justify-end space-x-3 mt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editEssay}
                      disabled={!editInstructions.trim() || loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Apply Changes
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default EssayGenerator; 