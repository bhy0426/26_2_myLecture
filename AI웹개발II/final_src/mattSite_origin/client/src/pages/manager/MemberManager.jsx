import { useState } from 'react';
import { api } from '../../shared/api';
import { useAction } from '../../shared/hooks';
import { Field } from '../../shared/components';

export default function MemberManager({ users, lectures, onChange }) {
    const [memberId, setMemberId] = useState('');
    const [studentId, setStudentId] = useState('');
    const [lectureId, setLectureId] = useState('');
    const members = users.filter((user) => !user.canManage);
    const students = members.filter((user) => user.status === 'active');
    const member = members.find((user) => String(user.id) === memberId) || members[0];
    const student = students.find((user) => String(user.id) === studentId) || students[0];
    const lecture = lectures.find((row) => String(row.id) === lectureId) || lectures[0];
    const action = useAction();
    const states = { pending: '승인 대기', active: '승인', suspended: '정지' };
    function changeStatus(status) {
        return action.run(async () => {
            const result = await api('PATCH', `/manager/users/${member.id}/status`, { status });
            onChange();
            return result;
        });
    }
    function access(grant) {
        return action.run(() =>
            api(
                grant ? 'POST' : 'DELETE',
                `/manager/users/${student.id}/lectures` + (grant ? '' : '/' + lecture.id),
                grant ? { lectureId: lecture.id } : undefined,
            ),
        );
    }
    return (
        <section>
            <h3>회원 승인·정지</h3>
            <p role="status">{action.message}</p>
            <Field
                label="회원"
                as="select"
                value={member?.id || ''}
                onChange={(event) => setMemberId(event.target.value)}
            >
                {members.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name} — {states[user.status]}
                    </option>
                ))}
            </Field>
            <button disabled={action.busy || !member} onClick={() => changeStatus('active')}>
                승인·정지 해제
            </button>
            <button disabled={action.busy || !member} onClick={() => changeStatus('suspended')}>
                정지
            </button>
            <h3>학생별 시청 권한</h3>
            <Field
                label="학생"
                as="select"
                value={student?.id || ''}
                onChange={(event) => setStudentId(event.target.value)}
            >
                {students.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.name}
                    </option>
                ))}
            </Field>
            <Field
                label="강의"
                as="select"
                value={lecture?.id || ''}
                onChange={(event) => setLectureId(event.target.value)}
            >
                {lectures.map((row) => (
                    <option key={row.id} value={row.id}>
                        {row.title}
                    </option>
                ))}
            </Field>
            <button disabled={action.busy || !student || !lecture} onClick={() => access(true)}>
                30일 시청 허용
            </button>
            <button disabled={action.busy || !student || !lecture} onClick={() => access(false)}>
                권한 회수
            </button>
        </section>
    );
}
