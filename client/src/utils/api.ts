export const fetchWithAuth = async (url: string, options?: RequestInit) => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/admin/login';
        throw new Error('No token found');
    }
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options?.headers
        }
    });
    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
        throw new Error('Unauthorized');
    }
    return response.json();
};
