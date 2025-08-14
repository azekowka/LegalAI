'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageAvatar } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputAttachButton,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { useState } from 'react';
import { Response } from '@/components/ai-elements/response';
import { GlobeIcon, MicIcon, UploadIcon, CameraIcon, ScreenShareIcon, ImageIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/source';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';

const models = [
  { id: 'gpt-5', name: 'GPT-5' },
  { id: 'claude-4', name: 'Claude-4' },
];

// Mock messages with parts structure
const mockMessages = [
  {
    id: '1',
    role: 'user' as const,
    parts: [
      {
        type: 'text' as const,
        text: 'What are the latest trends in AI?',
      },
    ],
  },
  {
    id: '2',
    role: 'assistant' as const,
    parts: [
      {
        type: 'reasoning' as const,
        text: 'Let me think about the current AI trends. I should consider recent developments in machine learning, generative AI, and emerging technologies.',
      },
      {
        type: 'source-url' as const,
        url: 'https://example.com/ai-trends-2024',
        title: 'AI Trends 2024 Report',
      },
      {
        type: 'source-url' as const,
        url: 'https://example.com/machine-learning-advances',
        title: 'Machine Learning Advances',
      },
      {
        type: 'text' as const,
        text: 'Based on recent developments, here are the key AI trends:\n\n1. **Large Language Models (LLMs)** continue to evolve with better reasoning capabilities\n2. **Multimodal AI** that can process text, images, and audio simultaneously\n3. **AI Agents** that can perform complex tasks autonomously\n4. **Edge AI** bringing intelligence to local devices\n5. **Responsible AI** focusing on safety and ethical considerations',
      },
    ],
  },
  {
    id: '3',
    role: 'user' as const,
    parts: [
      {
        type: 'text' as const,
        text: 'How does machine learning work?',
      },
    ],
  },
  {
    id: '4',
    role: 'assistant' as const,
    parts: [
      {
        type: 'reasoning' as const,
        text: 'I need to explain machine learning in a clear and accessible way. I should cover the basic concepts, types of ML, and how algorithms learn from data.',
      },
      {
        type: 'text' as const,
        text: 'Machine learning is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed for every task.\n\n**How it works:**\n\n1. **Data Collection**: Gather relevant data for training\n2. **Algorithm Selection**: Choose appropriate ML algorithms\n3. **Training**: Feed data to the algorithm to learn patterns\n4. **Validation**: Test the model on new data\n5. **Deployment**: Use the trained model for predictions\n\n**Types of Machine Learning:**\n- **Supervised Learning**: Learning with labeled examples\n- **Unsupervised Learning**: Finding patterns in unlabeled data\n- **Reinforcement Learning**: Learning through trial and error with rewards',
      },
    ],
  },
];

// Suggestions for the prompt input
const suggestions = [
  'What are the latest trends in AI?',
  'How does machine learning work?',
  'Explain quantum computing',
];

const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].id);
  const [webSearch, setWebSearch] = useState(false);
  const [messages, setMessages] = useState(mockMessages);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Add user message
      const userMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        parts: [
          {
            type: 'text' as const,
            text: input,
          },
        ],
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsStreaming(true);
      
      // Simulate AI response after delay
      setTimeout(() => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          parts: [
            {
              type: 'reasoning' as const,
              text: 'Let me analyze this question and provide a comprehensive response based on available information.',
            },
            {
              type: 'source-url' as const,
              url: 'https://example.com/mock-source',
              title: 'Mock Source for Demo',
            },
            {
              type: 'text' as const,
              text: `Thank you for your question: "${input}". This is a mock response to demonstrate the AI Elements interface. In a real implementation, this would be generated by an actual AI model with proper reasoning and sources.`,
            },
          ],
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsStreaming(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Conversation className="h-full">
        <ConversationContent>
          {messages.length === 0 && (
            <div className="p-4">
              <Suggestions>
                {suggestions.map((suggestion, i) => (
                  <Suggestion
                    key={i}
                    suggestion={suggestion}
                    onClick={(suggestion) => setInput(suggestion)}
                  />
                ))}
              </Suggestions>
            </div>
          )}
          {messages.map((message) => {
            const sourceParts = message.parts.filter(part => part.type === 'source-url');
            return (
              <div key={message.id}>
                {message.role === 'assistant' && sourceParts.length > 0 && (
                   <Sources defaultOpen={true}>
                     <SourcesTrigger count={sourceParts.length} />
                     <SourcesContent>
                       {sourceParts.map((part, i) => (
                         <Source
                           key={`${message.id}-source-${i}`}
                           href={part.url}
                           title={part.title || part.url}
                         />
                       ))}
                     </SourcesContent>
                   </Sources>
                 )}
                <Message from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, i) => {
                      switch (part.type) {
                        case 'text':
                          return (
                            <Response key={`${message.id}-${i}`}>
                              {part.text}
                            </Response>
                          );
                        case 'reasoning':
                           return (
                             <Reasoning
                               key={`${message.id}-${i}`}
                               className="w-full"
                               isStreaming={isStreaming}
                             >
                               <ReasoningTrigger />
                               <ReasoningContent>
                                 {part.text}
                               </ReasoningContent>
                             </Reasoning>
                           );
                        case 'source-url':
                          // Sources are handled separately above
                          return null;
                        default:
                          return null;
                      }
                    })}
                  </MessageContent>
                  <MessageAvatar
                    src={message.role === 'user' ? 'https://avatars.githubusercontent.com/u/4142719?v=4' : 'https://avatars.githubusercontent.com/u/14957082?v=4'}
                    name={message.role === 'user' ? 'You' : 'AI'}
                  />
                </Message>
              </div>
            );
          })}
          {isStreaming && (
            <Message from="assistant">
              <MessageContent>
                <Loader />
              </MessageContent>
              <MessageAvatar
                src="https://avatars.githubusercontent.com/u/14957082?v=4"
                name="AI"
              />
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      
      <div className="p-4">
          <Suggestions className="mb-4">
            {suggestions.map((suggestion, i) => (
              <Suggestion
                key={i}
                suggestion={suggestion}
                onClick={(suggestion) => setInput(suggestion)}
              />
            ))}
          </Suggestions>
          <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What would you like to know?"
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <PromptInputAttachButton />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <UploadIcon size={16} className="mr-2" />
                    Upload File
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ImageIcon size={16} className="mr-2" />
                    Upload Image
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CameraIcon size={16} className="mr-2" />
                    Take Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ScreenShareIcon size={16} className="mr-2" />
                    Screen Capture
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <PromptInputButton>
                     <MicIcon size={16} />
                   </PromptInputButton>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent>
                   <DropdownMenuItem>
                     <MicIcon size={16} className="mr-2" />
                     Record Voice
                   </DropdownMenuItem>
                   <DropdownMenuItem>
                     <UploadIcon size={16} className="mr-2" />
                     Upload Audio
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
              <PromptInputButton
                onClick={() => setWebSearch(!webSearch)}
                variant={webSearch ? 'default' : 'ghost'}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect value={model} onValueChange={setModel}>
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue placeholder="Select model" />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input.trim()} status={isStreaming ? 'streaming' : 'ready'} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;