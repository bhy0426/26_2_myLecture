import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../shared/api';
import { useAction } from '../shared/hooks';
import { Field, Form, Page } from '../shared/components';

export default function ResetPage() {
    const [params, setParams] = useSearchParams();
    const token = params.get('token');
    const [done, setDone] = useState(false);
    const action = useAction();
    return (
        <Page title="비밀번호 재설정" message={action.message}>
            {!done && (
                <Form
                    busy={action.busy}
                    onSubmit={(form) =>
                        action.run(async () => {
                            const body = token
                                ? { token, password: form.get('password') }
                                : { email: form.get('email') };
                            if (token && body.password !== form.get('confirmPassword'))
                                throw new Error('비밀번호가 일치하지 않습니다.');
                            const result = await api('POST', '/auth/reset', body);
                            setDone(true);
                            if (token) setParams({}, { replace: true });
                            return result;
                        })
                    }
                >
                    {token ? (
                        <>
                            <Field
                                label="새 비밀번호"
                                name="password"
                                type="password"
                                minLength={8}
                                maxLength={128}
                                autoComplete="new-password"
                                required
                            />
                            <Field
                                label="새 비밀번호 확인"
                                name="confirmPassword"
                                type="password"
                                minLength={8}
                                maxLength={128}
                                autoComplete="new-password"
                                required
                            />
                        </>
                    ) : (
                        <Field
                            label="가입한 이메일"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                        />
                    )}
                    <button>{token ? '비밀번호 변경' : '재설정 메일 요청'}</button>
                </Form>
            )}
            <Link to="/login">로그인으로</Link>
        </Page>
    );
}
