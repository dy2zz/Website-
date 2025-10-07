const getApiBaseUrl = () => {
    const hostname = window.location.hostname;

    if (hostname === '127.0.0.1' || hostname === 'localhost') {
        return 'https://nodefibear.onrender.com';
    }
};

export const API_BASE_URL = getApiBaseUrl();
