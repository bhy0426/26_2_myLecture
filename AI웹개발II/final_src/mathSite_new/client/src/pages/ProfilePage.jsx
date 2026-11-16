import { useAuth } from '../shared/auth';
import { api } from '../shared/api';
import { useAction, useResource } from '../shared/hooks';
import { Field, Form, Page } from '../shared/components';

export default function ProfilePage() {
    const { user, setUser } = useAuth();
    const status = useResource('/auth/kakao/status');
    const action = useAction();
    return (
        <Page title="내 정보" message={action.message || status.error}>
            <Form
                busy={action.busy}
                onSubmit={(form) =>
                    action.run(async () => {
                        const result = await api('PATCH', '/user', Object.fromEntries(form));
                        setUser(result.user);
                        return result;
                    })
                }
            >
                <Field label="이름" name="name" defaultValue={user.name} maxLength={80} required />
                <Field
                    label="아이디"
                    name="username"
                    defaultValue={user.username || ''}
                    pattern="[a-z][a-z0-9_]{3,39}"
                    required
                />
                <Field
                    label="이메일"
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    required
                />
                <button>저장</button>
            </Form>
            {status.data?.configured && !status.data.linked && (
                <p>
                    <a href="/auth/kakao/link">현재 계정에 카카오 연결</a>
                </p>
            )}
        </Page>
    );
}
