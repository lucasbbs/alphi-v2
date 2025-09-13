'use client'
import { Roles } from 'types/globals'
import { useUser } from '@clerk/nextjs'

export const checkRole = async (role: Roles) => {
  const { user } = useUser()
  console.log({ userRole: user?.publicMetadata.role })
  return user?.publicMetadata.role === role
}