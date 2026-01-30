'use client'

import { useEffect, useState } from 'react'
import useFirebaseAuth from '@/lib/hooks/useFirebaseAuth'
import FastGasHomePage from '@/components/FastGasHomePage'
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

    // Use FastGas home page for all users
    return <FastGasHomePage user={userData} />
}
