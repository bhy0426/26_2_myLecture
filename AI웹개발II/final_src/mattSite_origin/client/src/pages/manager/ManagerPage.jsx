import { useState } from 'react';
import { useResource } from '../../shared/hooks';
import { Page } from '../../shared/components';
import MemberManager from './MemberManager';
import CourseManager from './CourseManager';
import LectureManager from './LectureManager';

export default function ManagerPage() {
    const members = useResource('/manager/users');
    const courses = useResource('/courses');
    const [selectedId, setSelectedId] = useState('');
    const rows = courses.data?.courses || [];
    const course = rows.find((row) => String(row.id) === String(selectedId)) || rows[0];
    const lectures = useResource(course ? `/courses/${course.id}/lectures` : null);
    return (
        <Page title="관리자" message={members.error || courses.error || lectures.error}>
            <MemberManager
                users={members.data?.users || []}
                lectures={lectures.data?.lectures || []}
                onChange={members.reload}
            />
            <CourseManager
                courses={rows}
                course={course}
                onSelect={setSelectedId}
                onChange={courses.reload}
            />
            {course && (
                <LectureManager
                    key={course.id}
                    course={course}
                    lectures={lectures.data?.lectures || []}
                    onChange={lectures.reload}
                />
            )}
        </Page>
    );
}
