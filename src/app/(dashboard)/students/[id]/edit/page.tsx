import Link from 'next/link'
import { getStudent } from '@/lib/students/actions'
import { StudentForm } from '../../components/student-form'

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const student = await getStudent(id)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/students" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          &larr; Back to students
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Edit student</h1>
      </div>
      <StudentForm student={student} />
    </div>
  )
}
