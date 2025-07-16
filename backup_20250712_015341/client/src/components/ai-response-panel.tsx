import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Bot, User, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@shared/schema";

interface AiResponsePanelProps {
  height: number;
  response: {
    response: string;
    explanation?: string;
    examples?: string[];
    question: string;
  } | null;
  onClear: () => void;
  sessionId: string;
  onAiResponse: (response: any) => void;
}

export default function AiResponsePanel({ height, response, onClear, sessionId, onAiResponse }: AiResponsePanelProps) {
  const [message, setMessage] = useState("");
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/${sessionId}`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      const response = await apiRequest("POST", "/api/chat", {
        message: messageText,
        sender: "user",
        sessionId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
      onAiResponse({
        response: data.aiMessage.message,
        explanation: data.explanation,
        examples: data.examples,
        question: data.userMessage.message,
      });
      setShowChat(false); // Hide chat after response
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/chat/${sessionId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div 
      className="bg-gray-800 flex flex-col"
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white">AI Math Tutor</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => {
                if (!showChat) {
                  // Clear chat history AND formatted response when opening fresh chat
                  // Clear the cache immediately to prevent old messages from showing
                  queryClient.setQueryData(["/api/chat", sessionId], []);
                  clearChatMutation.mutate();
                  onClear(); // Clear the formatted response too
                } else {
                  // Close chat AND clear formatted response
                  onClear(); // Clear the formatted response
                }
                setShowChat(!showChat);
              }}
              variant="outline"
              size="sm"
              className="text-gray-300 border-gray-600 hover:bg-gray-700"
            >
              {showChat ? "Close Chat" : "Ask Question"}
            </Button>
            {response && (
              <button
                onClick={onClear}
                className="text-gray-400 hover:text-white transition-colors"
                title="Clear AI Response"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Chat Messages Section (when showChat is true) */}
        {showChat && (
          <div className="p-4 border-b border-gray-700">
            <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
              {messages.length === 0 && (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                      <p className="text-white text-sm">How can I assist you with math today?</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Just now</p>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === "user" ? "bg-gray-600" : "bg-blue-500"
                  }`}>
                    {msg.sender === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`p-3 rounded-lg ${
                      msg.sender === "user" 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-700 border border-gray-600 text-white"
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(msg.timestamp.toString())}
                    </p>
                  </div>
                </div>
              ))}

              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-4 rounded-lg border border-blue-500/50 shadow-lg">
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-blue-200 font-medium">AI is thinking...</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask the AI tutor a question..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 text-white bg-gray-700 border-gray-600 placeholder-gray-400"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="text-white bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* AI Response Section */}
        {response ? (
          <div className="p-4 space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-300 mb-1">Your question:</p>
                <p className="text-gray-400 text-sm italic">"{String(response.question || 'No question provided')}"</p>
              </div>
                  
              <div className="text-white mb-3">
                {(() => {
                  const responseText = String(response.response || '');
                  console.log('AI Response Panel - response object:', response);
                  console.log('AI Response Panel - response text:', responseText);
                  
                  // Parse the universal JSON format
                  try {
                    const parsed = JSON.parse(responseText);
                    console.log('AI Response Panel - parsed:', parsed);
                    return (
                      <div className="space-y-3">
                        {parsed.summary && (
                          <div className="bg-blue-900/30 p-3 rounded border border-blue-600">
                            <h4 className="font-medium text-blue-200 mb-1">Summary:</h4>
                            <p className="text-gray-300">{parsed.summary}</p>
                          </div>
                        )}
                        
                        {parsed.question && (
                          <div className="bg-green-900/30 p-3 rounded border border-green-600">
                            <h4 className="font-medium text-green-200 mb-1">Question:</h4>
                            <p className="text-gray-300">{parsed.question}</p>
                          </div>
                        )}
                        
                        {parsed.steps && Array.isArray(parsed.steps) && (
                          <div className="bg-purple-900/30 p-3 rounded border border-purple-600">
                            <h4 className="font-medium text-purple-200 mb-2">Step-by-Step Solution:</h4>
                            <div className="space-y-2">
                              {parsed.steps.map((step, index) => {
                                // Extract the step content without "Step X:" prefix
                                const stepText = String(step).replace(/^Step \d+:\s*/, '');
                                return (
                                  <div key={index} className="bg-purple-800/30 p-3 rounded flex items-start gap-2">
                                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-medium min-w-fit">
                                      Step {index + 1}
                                    </span>
                                    <p className="text-gray-300 text-sm">{stepText}</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } catch (e) {
                    // Fallback for non-JSON responses
                    return (
                      <div className="space-y-3">
                        <div className="bg-blue-900/30 p-3 rounded border border-blue-600">
                          <h4 className="font-medium text-blue-200 mb-1">AI Response:</h4>
                          <p className="text-gray-300">{responseText}</p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
              
              {response.explanation && (
                <div className="bg-yellow-900/30 p-3 rounded border border-yellow-600 mb-3">
                  <p className="text-sm font-medium text-yellow-200 mb-1">Explanation:</p>
                  <p className="text-gray-300 text-sm">
                    {(() => {
                      try {
                        const parsed = JSON.parse(String(response.explanation));
                        return typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(response.explanation);
                      } catch (e) {
                        return String(response.explanation);
                      }
                    })()}
                  </p>
                </div>
              )}
              
              {response.examples && response.examples.length > 0 && (
                <div className="bg-teal-900/30 p-3 rounded border border-teal-600">
                  <p className="text-sm font-medium text-teal-200 mb-2">Examples:</p>
                  <div className="space-y-2">
                    {response.examples.map((example, index) => (
                      <div key={index} className="bg-teal-800/30 p-2 rounded">
                        <p className="text-gray-300 text-sm">
                          {(() => {
                            try {
                              const parsed = JSON.parse(String(example));
                              return typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(example);
                            } catch (e) {
                              return String(example);
                            }
                          })()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : !showChat && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No AI response yet</p>
              <p className="text-gray-500 text-sm">Click "Ask Question" to chat with the AI tutor or wait for automatic help</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}