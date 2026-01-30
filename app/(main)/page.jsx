'use client'

import { useEffect, useState } from 'react'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import DefaultHomePage from '@/components/DefaultHomePage'
import AuthenticatedHome from '@/components/AuthenticatedHome'
import Loading from '../loading'

export default function Page() {
    const { user, userData, loading } = useFirebaseAuth()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted || loading) {
        return <Loading />
    }

    if (user && userData) {
        return <AuthenticatedHome user={userData} />
    }
    
    return <DefaultHomePage />
}
