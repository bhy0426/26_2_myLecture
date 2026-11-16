import { api } from '../../shared/api';
import { useAuth } from '../../shared/auth';
import { Field, Form } from '../../shared/components';
import { useAction, useResource } from '../../shared/hooks';

export default function MailSettings() {
    const settings = useResource('/manager/mail');
    const action = useAction();
    const { reloadAuth } = useAuth();
    const current = settings.data;
    const pending = current?.pending;

    async function sendCode(form, element) {
        const result = await api('POST', '/manager/mail/verification', Object.fromEntries(form));
        element.reset();
        settings.reload();
        return result;
    }

    async function confirmSender(form) {
        try {
            const result = await api('POST', '/manager/mail/confirm', {
                verificationId: pending.verificationId,
                code: form.get('code'),
            });
            // 다음 회원 관리 작업에서도 새 발신자의 메일 사용 가능 여부를 반영한다.
            reloadAuth().catch(() => {});
            return result;
        } finally {
            settings.reload();
        }
    }

    return (
        <section>
            <h3>발신 메일 관리</h3>
            {current && (
                <p>
                    현재 발신 주소 <strong>{current.sender || '미설정'}</strong>
                    {current.source === 'environment' && ' (서버 기본값)'}
                    {current.verifiedAt &&
                        ' · 확인일 ' + new Date(current.verifiedAt).toLocaleDateString()}
                </p>
            )}
            {current?.warning && <p role="alert">{current.warning}</p>}
            <p>
                가입 인증과 비밀번호 재설정 메일을 보낼 계정을 등록하세요. 새 주소에서 인증코드를
                확인하면 발신자가 바뀝니다.
            </p>
            <details>
                <summary>2단계 인증과 앱 비밀번호 설정 방법</summary>
                <p>
                    Gmail은{' '}
                    <a
                        href="https://myaccount.google.com/signinoptions/two-step-verification"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Google 계정에서 2단계 인증을 켠 뒤
                    </a>{' '}
                    <a
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noreferrer"
                    >
                        MathSite용 앱 비밀번호를 발급
                    </a>
                    하세요.
                </p>
                <p>
                    네이버는 계정에서 2단계 인증과 애플리케이션 비밀번호를 설정하고, 메일
                    환경설정에서 IMAP/SMTP 사용을 켜세요.{' '}
                    <a
                        href="https://help.naver.com/service/30029/contents/21344"
                        target="_blank"
                        rel="noreferrer"
                    >
                        네이버 설정 안내
                    </a>
                </p>
            </details>
            <p role="status">{action.message || settings.error}</p>
            <Form
                busy={action.busy || !current}
                onSubmit={(form, element) => action.run(() => sendCode(form, element))}
            >
                <Field
                    label="새 발신 주소 (Gmail 또는 네이버)"
                    name="email"
                    type="email"
                    required
                />
                <Field
                    label="메일 서비스에서 발급한 앱 비밀번호"
                    name="appPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                />
                <button>새 주소로 인증코드 보내기</button>
            </Form>
            {pending && (
                <Form
                    key={pending.verificationId}
                    busy={action.busy}
                    onSubmit={(form) => action.run(() => confirmSender(form))}
                >
                    <p>
                        {pending.email} 받은편지함에서 코드를 확인하세요. 입력 기한은{' '}
                        {new Date(pending.expiresAt).toLocaleTimeString()}까지입니다.
                    </p>
                    <Field
                        label="발신 주소 인증코드"
                        name="code"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        autoComplete="one-time-code"
                        required
                    />
                    <button>확인하고 발신 주소 적용</button>
                </Form>
            )}
        </section>
    );
}
