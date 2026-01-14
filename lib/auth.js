// Mock user database
const users = [
    {
        id: '1',
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User'
    }
]

export function validateCredentials(email, password) {
    const user = users.find(u => u.email === email && u.password === password)
    if (user) {
        // Return user without password
        const { password: _, ...userWithoutPassword } = user
        return userWithoutPassword
    }
    return null
}

export function generateToken(user) {
    // In production, use JWT or a proper session token
    return Buffer.from(JSON.stringify({
        id: user.id,
        email: user.email,
        timestamp: Date.now()
    })).toString('base64')
}

export function verifyToken(token) {
    try {
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        // Check if token is not older than 24 hours
        const hoursSinceCreation = (Date.now() - decoded.timestamp) / (1000 * 60 * 60)
        if (hoursSinceCreation > 24) {
            return null
        }
        return decoded
    } catch (error) {
        return null
    }
}
