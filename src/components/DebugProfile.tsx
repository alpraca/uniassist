'use client';

import React from 'react';

interface DebugProfileProps {
  profile: any;
  formattedProfile: any;
  apiKey: string;
}

export default function DebugProfile({ profile, formattedProfile, apiKey }: DebugProfileProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm font-mono">
      <h3 className="font-bold mb-2">Debug Information</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">API Key Status:</h4>
        <p>{apiKey ? '✅ API Key is set' : '❌ API Key is missing'}</p>
        {apiKey && <p>First 4 chars: {apiKey.substring(0, 4)}...</p>}
      </div>

      <div className="mb-4">
        <h4 className="font-semibold">Raw Profile:</h4>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>

      <div>
        <h4 className="font-semibold">Formatted Profile:</h4>
        <pre className="bg-gray-100 p-2 rounded">
          {JSON.stringify(formattedProfile, null, 2)}
        </pre>
      </div>
    </div>
  );
} 