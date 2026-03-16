import { SignupForm } from '#/components/web/signup-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/signup/')({
  component: Signup,
})

export function Signup() {
  return <SignupForm />
}
