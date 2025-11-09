'use client';

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from '@/components/ai-elements/prompt-input';
import { Wand2 } from 'lucide-react';

const AiPromptInput = () => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
      <div className="relative">
        <Wand2 className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <PromptInput>
          <PromptInputTextarea
            placeholder="Edit this document with AI"
            className="pl-12"
          />
          <PromptInputToolbar>
            <div className="flex-grow" />
            <PromptInputSubmit />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default AiPromptInput;
