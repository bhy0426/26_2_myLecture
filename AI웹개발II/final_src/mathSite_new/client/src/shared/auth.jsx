import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => {
        api('GET', '/auth/status')
            .then(({ user }) => setUser(user))
            .catch((error) => setError(error.message))
            .finally(() => setLoading(false));
    }, []);
    return (
        <AuthContext.Provider value={{ user, setUser, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

// 화면 접근 검사. 실제 API 권한 검사는 Express에서도 매번 수행한다.
export function RequireUser({ admin = false, children }) {
    const { user, loading, error } = useAuth();
    if (loading) return <p role="status">로그인 상태 확인 중…</p>;
    if (error) return <p role="alert">{error}</p>;
    if (!user) return <Navigate to="/login" replace />;
    if (admin && !user.canManage) return <p role="alert">관리자만 접근할 수 있습니다.</p>;
    return children;
}
