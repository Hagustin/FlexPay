import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { X } from 'lucide-react';
import { Banknote, Send, BotMessageSquare } from 'lucide-react';
import { ASK_CHATBOT } from '../graphql/queries';
import AuthService from '../utils/auth';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');

  const userProfile = AuthService.getProfile();
  const userId = userProfile?.id || null;

  const [askChatbot, { loading, error }] = useLazyQuery(ASK_CHATBOT, {
    onCompleted: (data) => {
      setResponse(data.askChatbot.response);
    },
  });

  const handleAsk = (query: string) => {
    setQuestion(query);
    const variables = userId
      ? { userId, question: query }
      : { question: query };
    askChatbot({ variables });
  };

  return (
    <>
      {/* Fintech-Themed Floating Chat Button */}
      {!isOpen && (
        <button
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-4 rounded-full shadow-xl flex items-center justify-center transition-all duration-300"
          onClick={() => setIsOpen(true)}
        >
          <Banknote size={28} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-6 w-80 bg-white border border-gray-300 rounded-xl shadow-xl p-5 flex flex-col transition-all duration-300">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-semibold text-gray-700 flex items-center">
              <BotMessageSquare className="mr-2 text-blue-600" size={20} />
              FlexPay AI Assistant
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={22} />
            </button>
          </div>

          {/* Suggested Questions */}
          <div className="mt-3 space-y-2">
            <p className="text-sm text-gray-500">Quick Help:</p>
            {[
              'How do I add funds?',
              'How do I withdraw money?',
              'Where can I use FlexPay?',
              'How to sign up and log in?',
            ].map((q) => (
              <button
                key={q}
                className="w-full text-left bg-gray-200 hover:bg-gray-300 p-3 rounded-md text-sm transition-all duration-300"
                onClick={() => handleAsk(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Response */}
          {loading && <p className="text-blue-500 text-sm mt-3">Thinking...</p>}
          {error && (
            <p className="text-red-500 text-sm mt-3">Error: {error.message}</p>
          )}
          {response && (
            <div className="mt-3 p-3 bg-gray-100 border rounded-md text-sm text-gray-700">
              {response}
            </div>
          )}

          {/* User Input */}
          <div className="mt-4 flex items-center">
            <input
              type="text"
              placeholder="Ask me anything..."
              className="flex-1 border p-3 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              className="ml-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-3 rounded-md text-sm hover:from-blue-600 hover:to-blue-800 transition-all duration-300 flex items-center"
              onClick={() => handleAsk(question)}
              disabled={!question.trim() || loading}
            >
              <Send size={18} className="mr-1" />
              Ask
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
