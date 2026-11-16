import { api } from '../../shared/api';
import { useAction, useResource } from '../../shared/hooks';
import { Field, Form } from '../../shared/components';

export default function SiteSettings() {
    const settings = useResource('/info/settings');
    const action = useAction();
    return (
        <section>
            <h3>카카오 채널·메일 연결</h3>
            <p role="status">{action.message || settings.error}</p>
            {settings.data && (
                <>
                    <p>
                        비밀번호 재설정 메일:{' '}
                        {settings.data.mailConfigured ? 'SMTP 설정 있음' : 'SMTP 설정 필요'}
                    </p>
                    <Form
                        key={settings.data.channelUrl}
                        busy={action.busy}
                        onSubmit={(form) =>
                            action.run(async () => {
                                const result = await api(
                                    'PATCH',
                                    '/info/settings',
                                    Object.fromEntries(form),
                                );
                                settings.reload();
                                return result;
                            })
                        }
                    >
                        <Field
                            label="카카오 채널 주소 (비워 두면 표시 안 함)"
                            name="channelUrl"
                            type="url"
                            defaultValue={settings.data.channelUrl}
                        />
                        <button>채널 주소 저장</button>
                    </Form>
                </>
            )}
        </section>
    );
}
