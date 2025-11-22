import { fetchEventSource } from '@microsoft/fetch-event-source'

const API_BASE_URL = 'http://localhost:8000/api'

export function chatWithUniversalAgent(threadId: string, messages: string[]) {
    return fetch(`${API_BASE_URL}/universal-agent/chat`, {
        method: 'POST',
        body: JSON.stringify({ thread_id: threadId, messages }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .then((data) => data['messages'])
        .catch((error) => {
            console.error('Error calling Universal Agent:', error)
            return null
        })
}

export async function chatWithUniversalAgentInStreamingMode(
    threadId: string,
    messages: string[],
    /* eslint-disable @typescript-eslint/no-explicit-any */
    callback: (data: { [key: string]: any }) => void
) {
    await fetchEventSource(`${API_BASE_URL}/universal-agent/chat/stream`, {
        method: 'POST',
        headers: {
            Accept: 'text/event-stream',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages, thread_id: threadId }),
        async onopen(res) {
            if (res.ok && res.status === 200) {
                console.log('Connection made ', res)
            } else if (
                res.status >= 400 &&
                res.status < 500 &&
                res.status !== 429
            ) {
                console.log('Client-side error ', res)
            }
        },
        onmessage(event) {
            console.log(event.data)
            const parsedData = JSON.parse(event.data)
            callback(parsedData)
        },
        onclose() {
            console.log('Connection closed by the server')
        },
        onerror(err) {
            console.log('There was an error from server', err)
        },
    })
}

export async function fetchConversations() {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    return response.json()
}

export async function fetchConversationHistory(threadId: string) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/conversations/${threadId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )

        if (!response.ok) {
            throw new Error(
                `Failed to fetch conversation: ${response.statusText}`
            )
        }

        const data = await response.json()
        return data.messages
    } catch (error) {
        console.error('Error fetching conversation history:', error)
        return []
    }
}
