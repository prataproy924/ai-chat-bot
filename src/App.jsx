import { useState, useRef, useEffect } from 'react';
import { URL } from './constrains';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [conversation, setConversation] = useState([]);
  const [activeChat, setActiveChat] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat, isLoading]);

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Add user question to active chat
    const userQuestion = question.trim();
    const updatedChat = [...activeChat, { type: 'question', content: userQuestion }];
    setActiveChat(updatedChat);
    setQuestion('');
    
    try {
      const payload = {
        contents: [{
          parts: [{ text: userQuestion }]
        }]
      };

      const response = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const answerText = data.candidates[0].content.parts[0].text
        .replace(/\*\*/g, '')         
        .replace(/\*/g, '')          
        .replace(/\n/g, ' ')         
        .replace(/\s+/g, ' ')         
        .trim();

      const finalChat = [...updatedChat, { type: 'answer', content: answerText }];
      setActiveChat(finalChat);
      setConversation(prev => [...prev, { 
        id: Date.now(), 
        title: userQuestion.slice(0, 30) + (userQuestion.length > 30 ? '...' : ''),
        chat: finalChat 
      }]);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChat = (chatId) => {
    const selectedChat = conversation.find(c => c.id === chatId);
    if (selectedChat) {
      setActiveChat(selectedChat.chat);
    }
  };

  const startNewChat = () => {
    setActiveChat([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      askQuestion();
    }
  };

  return (
    <div className='grid grid-cols-5 h-screen'>
      <div className='col-span-1 bg-zinc-800 text-white p-4 flex flex-col'>
        <h2 className='text-xl font-bold mb-4'>Chat History</h2>
        <button 
          onClick={startNewChat}
          className='mb-4 p-2 bg-blue-600 rounded hover:bg-blue-700'
        >
          New Chat
        </button>
        <div className='flex-1 overflow-y-auto'>
          {conversation.map((conv) => (
            <div 
              key={conv.id}
              onClick={() => loadChat(conv.id)}
              className={`p-3 mb-2 rounded cursor-pointer hover:bg-zinc-700 ${
                activeChat === conv.chat ? 'bg-zinc-700 border-l-4 border-blue-500' : ''
              }`}
            >
              <p className='truncate'>{conv.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='col-span-4 flex flex-col h-screen'>
        <div className='flex-1 overflow-y-auto p-6'>
          {activeChat.length === 0 && !isLoading && (
            <div className='flex items-center justify-center h-full'>
              <div className='text-center text-zinc-500'>
                <h3 className='text-2xl mb-2'>Start a new conversation</h3>
                <p>Ask me anything!</p>
              </div>
            </div>
          )}

          {activeChat.map((item, index) => (
            <div 
              key={index}
              className={`flex mb-4 ${item.type === 'question' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-3/4 rounded-lg p-4 ${
                  item.type === 'question' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-zinc-800 text-white rounded-bl-none'
                }`}
              >
                <p className='whitespace-pre-wrap'>{item.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className='flex justify-start mb-4'>
              <div className='bg-zinc-800 text-white p-4 rounded-lg rounded-bl-none max-w-3/4'>
                <p>Thinking...</p>
              </div>
            </div>
          )}

          {error && (
            <div className='flex justify-start mb-4'>
              <div className='bg-red-900 text-white p-4 rounded-lg rounded-bl-none max-w-3/4'>
                <p>Error: {error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className='p-4 border-t border-zinc-700'>
          <div className='bg-zinc-800 w-full p-1 text-white rounded-2xl border border-zinc-700 flex'>
            <input 
              type='text' 
              value={question} 
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Ask me anything...' 
              className='w-full p-3 outline-none bg-transparent' 
              disabled={isLoading}
            />
            <button 
              onClick={askQuestion}
              disabled={isLoading || !question.trim()}
              className='px-4 py-2 bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]'
            >
              {isLoading ? '...' : 'Ask'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;