import Link from 'next/link'
import { StudentForm } from '../components/student-form'

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/students" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          &larr; Back to students
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Add student</h1>
      </div>
      <StudentForm />
    </div>
  )
}
