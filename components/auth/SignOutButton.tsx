'use client'

import { authClient } from '@/lib/auth-client'
import { useRouter } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useState } from 'react'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        },
      },
    })
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleSignOut} 
      disabled={loading}
      className="text-sepia hover:text-ink hover:bg-parchment-mid/30 gap-2"
    >
      <LogOut className="w-4 h-4" />
      <span>Sign out</span>
    </Button>
  )
}
