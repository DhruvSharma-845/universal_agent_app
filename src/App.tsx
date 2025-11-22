import { useState } from 'react'
import './App.css'
import { ChatWindow } from './components/ChatWindow'
import { ChatTabs } from './components/ChatTabs'
function App() {
    const [activeThreadId, setActiveThreadId] = useState<string>('1')

    const handleTabChange = (threadId: string) => {
        setActiveThreadId(threadId)
    }

    const handleNewChat = () => {
        // Optional: Add any additional logic when creating a new chat
        console.log('Creating new chat')
    }

    return (
        <div className="app-container">
            <ChatTabs
                activeThreadId={activeThreadId}
                onTabChange={handleTabChange}
                onNewChat={handleNewChat}
            />
            <ChatWindow key={activeThreadId} threadId={activeThreadId} />
        </div>
    )
}

export default App
