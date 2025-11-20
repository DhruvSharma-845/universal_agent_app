export function callUniversalAgent(messages: string[]) {
    return fetch('http://localhost:8000/api/universal-agent/chat', {
        method: 'POST',
        body: JSON.stringify({ messages }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => response.json())
        .catch((error) => {
            console.error('Error calling Universal Agent:', error)
            return null
        })
}
