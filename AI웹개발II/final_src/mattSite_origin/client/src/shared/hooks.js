import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

// 목록·상세 조회와 새로고침. 이전 화면의 늦은 응답은 반영하지 않는다.
export function useResource(url) {
    const [result, setResult] = useState({});
    const [revision, setRevision] = useState(0);
    const reload = useCallback(() => setRevision((value) => value + 1), []);
    useEffect(() => {
        if (!url) return;
        let active = true;
        api('GET', url).then(
            (data) => active && setResult({ url, data }),
            (error) => active && setResult({ url, error: error.message }),
        );
        return () => {
            active = false;
        };
    }, [url, revision]);
    return {
        data: result.url === url ? result.data : null,
        error: result.url === url ? result.error : '',
        reload,
    };
}

// 저장·삭제 요청의 처리 중 상태와 결과 문구를 공통으로 관리한다.
export function useAction() {
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    async function run(action) {
        setBusy(true);
        setMessage('');
        try {
            const result = await action();
            setMessage(result?.message || '');
            return result;
        } catch (error) {
            setMessage(error.message);
        } finally {
            setBusy(false);
        }
    }
    return { message, busy, run };
}
