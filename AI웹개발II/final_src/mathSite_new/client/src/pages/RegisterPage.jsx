import { Link } from 'react-router-dom';
import { api } from '../shared/api';
import { useAction } from '../shared/hooks';
import { Field, Form, Page } from '../shared/components';

export default function RegisterPage() {
    const action = useAction();
    return (
        <Page title="회원가입" message={action.message}>
            <Form
                busy={action.busy}
                onSubmit={(form, element) =>
                    action.run(async () => {
                        if (form.get('password') !== form.get('confirmPassword'))
                            throw new Error('비밀번호가 일치하지 않습니다.');
                        form.delete('confirmPassword');
                        const result = await api(
                            'POST',
                            '/auth/register',
                            Object.fromEntries(form),
                        );
                        element.reset();
                        return result;
                    })
                }
            >
                <Field
                    label="아이디 (영문 시작, 영문·숫자·밑줄 4~40자)"
                    name="username"
                    pattern="[a-z][a-z0-9_]{3,39}"
                    autoComplete="username"
                    required
                />
                <Field label="이름" name="name" maxLength={80} required />
                <Field label="이메일" name="email" type="email" autoComplete="email" required />
                <Field
                    label="비밀번호 (8~128자)"
                    name="password"
                    type="password"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                />
                <Field
                    label="비밀번호 확인"
                    name="confirmPassword"
                    type="password"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                />
                <button>가입 신청</button>
            </Form>
            <p>관리자 승인 후 로그인할 수 있습니다.</p>
            <Link to="/login">로그인으로</Link>
        </Page>
    );
}
