import { Link, useSearchParams } from 'react-router-dom';
import { Page } from '../../shared/components';
import MailSettings from './MailSettings';
import MemberManager from './MemberManager';
import MemberSettings from './MemberSettings';

const tabs = [
    { id: 'members', label: '회원 관리' },
    { id: 'signup', label: '가입·로그인 설정' },
    { id: 'mail', label: '메일 관리' },
];

export default function ManagerPage() {
    const [params] = useSearchParams();
    const active = tabs.find((tab) => tab.id === params.get('tab')) || tabs[0];
    return (
        <Page title="학원 관리">
            <nav aria-label="학원 관리 기능">
                {tabs.map((tab) => (
                    <Link
                        key={tab.id}
                        to={'/manager?tab=' + tab.id}
                        aria-current={tab.id === active.id ? 'page' : undefined}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>
            {active.id === 'members' && <MemberManager />}
            {active.id === 'signup' && <MemberSettings />}
            {active.id === 'mail' && <MailSettings />}
        </Page>
    );
}
