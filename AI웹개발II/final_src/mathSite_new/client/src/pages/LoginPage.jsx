import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../shared/auth';
import { api } from '../shared/api';
import { useAction, useResource } from '../shared/hooks';
import { Field, Form, Page } from '../shared/components';

export default function LoginPage() {
    const { user, setUser, loading } = useAuth();
    const [params] = useSearchParams();
    const status = useResource('/auth/kakao/status');
    const action = useAction();
    const [registered, setRegistered] = useState(false);
    const messages = {
        register: '이름·이메일을 입력하세요.',
        approval: '관리자 승인이 필요하거나 정지된 계정입니다.',
        cancelled: '카카오 로그인을 취소했습니다.',
    };
    if (!loading && user) return <Navigate to="/courses" replace />;
    return (
        <Page
            title="로그인"
            message={action.message || status.error || messages[params.get('kakao')]}
        >
            <p>
                <a href="/auth/kakao">카카오 로그인</a>
            </p>
            <details>
                <summary>아이디·이메일 로그인</summary>
                <Form
                    busy={action.busy}
                    onSubmit={(form) =>
                        action.run(async () => {
                            const result = await api(
                                'POST',
                                '/auth/login',
                                Object.fromEntries(form),
                            );
                            setUser(result.user);
                            return result;
                        })
                    }
                >
                    <Field
                        label="아이디 또는 이메일"
                        name="identifier"
                        autoComplete="username"
                        required
                    />
                    <Field
                        label="비밀번호"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                    />
                    <button>로그인</button>
                </Form>
            </details>
            <p>
                <Link to="/register">일반 회원가입</Link> · <Link to="/reset">비밀번호 재설정</Link>
            </p>
            {status.data?.registrationRequired && !registered && (
                <section>
                    <h3>가입 정보 입력</h3>
                    <p>카카오 인증을 완료했습니다. 가입 신청 후 관리자 승인이 필요합니다.</p>
                    <Form
                        busy={action.busy}
                        onSubmit={(form) =>
                            action.run(async () => {
                                const result = await api(
                                    'POST',
                                    '/auth/kakao/register',
                                    Object.fromEntries(form),
                                );
                                setRegistered(true);
                                return result;
                            })
                        }
                    >
                        <Field label="이름" name="name" maxLength={80} required />
                        <Field label="이메일" name="email" type="email" required />
                        <button>가입 신청</button>
                    </Form>
                </section>
            )}
        </Page>
    );
}
