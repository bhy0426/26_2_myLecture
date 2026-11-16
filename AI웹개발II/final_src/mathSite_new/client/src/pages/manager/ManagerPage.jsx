import { useEffect, useState } from 'react';
import { useResource } from '../../shared/hooks';
import { Page } from '../../shared/components';
import MemberManager from './MemberManager';
import CourseManager from './CourseManager';
import LectureManager from './LectureManager';
import RoleManager from './RoleManager';
import SiteSettings from './SiteSettings';

export default function ManagerPage() {
    const members = useResource('/manager/users');
    const roles = useResource('/manager');
    const courses = useResource('/courses');
    const [selectedId, setSelectedId] = useState('');
    const rows = courses.data?.courses || [];
    const course = rows.find((row) => String(row.id) === String(selectedId)) || rows[0];
    const lectures = useResource(course ? `/courses/${course.id}/lectures` : null);
    const processing = lectures.data?.lectures.some((item) => item.videoStatus === 'PROCESSING');
    useEffect(() => {
        if (!processing) return;
        const timer = setInterval(lectures.reload, 3000);
        return () => clearInterval(timer);
    }, [processing, lectures.reload]);
    return (
        <Page title="관리자" message={members.error || courses.error || lectures.error}>
            <MemberManager
                users={members.data?.users || []}
                roles={roles.data?.roles || []}
                lectures={lectures.data?.lectures || []}
                onChange={members.reload}
            />
            <RoleManager
                roles={roles.data?.roles || []}
                onChange={() => {
                    roles.reload();
                    members.reload();
                }}
            />
            <SiteSettings />
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
