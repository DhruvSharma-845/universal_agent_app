import './ChatWindow.css'
import { useState, useRef, useEffect } from 'react'
import type { Message } from '../models/Message'
import {
    // chatWithUniversalAgent,
    chatWithUniversalAgentInStreamingMode,
    fetchConversationHistory,
} from '../clients/UniversalAgentClient'

interface ChatWindowProps {
    threadId: string
}

export function ChatWindow({ threadId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Load conversation history on mount
    useEffect(() => {
        const loadHistory = async () => {
            setIsLoading(true)
            try {
                const history = await fetchConversationHistory(threadId)

                // Transform API response to Message format if needed
                const formattedMessages: Message[] = history.map(
                    (msg: { [key: string]: string }) => ({
                        id: msg.id,
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content,
                        timestamp: new Date(),
                    })
                )

                setMessages(formattedMessages)
            } catch (error) {
                console.error('Failed to load conversation history:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadHistory()
    }, [threadId])

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        // const response = await chatWithUniversalAgent(threadId, [
        //     userMessage.content,
        // ])
        // setMessages((prev) => [
        //     ...prev,
        //     ...response.map((msg: { [key: string]: string }) => ({
        //         id: Date.now().toString(),
        //         role: msg.role === 'user' ? 'user' : 'assistant',
        //         content: msg.content,
        //         timestamp: new Date(),
        //     })),
        // ])
        // setIsLoading(false)
        await chatWithUniversalAgentInStreamingMode(
            threadId,
            [userMessage.content],
            /* eslint-disable @typescript-eslint/no-explicit-any */
            (data: any) => {
                setMessages((prev) => [
                    ...prev,
                    ...data['messages'].map(
                        (msg: { [key: string]: string }) => ({
                            id: Date.now().toString(),
                            role: msg.role === 'user' ? 'user' : 'assistant',
                            content: msg.content,
                            timestamp: new Date(),
                        })
                    ),
                ])
                setIsLoading(false)
            }
        )
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <h1>AI Assistant</h1>
            </div>

            {/* Messages Container */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <h2>How can I help you today?</h2>
                        <p>Start a conversation by typing a message below.</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${message.role}`}
                        >
                            <div className="message-avatar">
                                {message.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className="message-content">
                                <div className="message-text">
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {isLoading && (
                    <div className="message assistant">
                        <div className="message-avatar">🤖</div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="input-container">
                <div className="input-wrapper">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message here..."
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim() || isLoading}
                        className="send-button"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M22 2L11 13" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
