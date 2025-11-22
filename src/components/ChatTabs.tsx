import { useEffect, useState } from 'react'
import { fetchConversations } from '../clients/UniversalAgentClient'
import './ChatTabs.css'

interface ChatTabsProps {
    activeThreadId: string
    onTabChange: (threadId: string) => void
    onNewChat: () => void
}

export function ChatTabs({
    activeThreadId,
    onTabChange,
    onNewChat,
}: ChatTabsProps) {
    const [threads, setThreads] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadConversations()
    }, [])

    const loadConversations = async () => {
        setIsLoading(true)
        try {
            const fetchedThreads = await fetchConversations()
            setThreads(fetchedThreads['threads'])
        } catch (error) {
            console.error('Failed to load conversations:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNewChat = () => {
        const newThreadId = Date.now().toString()
        setThreads((prev) => [...prev, newThreadId])
        onNewChat()
        onTabChange(newThreadId)
    }

    return (
        <div className="chat-tabs-container">
            <div className="tabs-wrapper">
                {isLoading ? (
                    <div className="tabs-loading">Loading conversations...</div>
                ) : (
                    <>
                        {threads.map((threadId) => (
                            <button
                                key={threadId}
                                className={`tab ${activeThreadId === threadId ? 'active' : ''}`}
                                onClick={() => onTabChange(threadId)}
                            >
                                Chat {threadId}
                            </button>
                        ))}
                    </>
                )}
            </div>
            <button className="new-chat-button" onClick={handleNewChat}>
                + New Chat
            </button>
        </div>
    )
}
