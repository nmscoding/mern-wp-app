import { Link, useNavigate } from "react-router-dom";
import './AdminNavigate.css';
import { useCallback, useEffect, useState } from "react";
import axios from "axios";

const AdminNavigate = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();

    const setCsrfToken = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/csrf-token`, {
                withCredentials: true,
            });
            axios.defaults.headers.common['CSRF-Token'] = response.data.csrfToken;
        } catch (error) {
            console.error('Error setting CSRF token:', error);
        }
    }, [apiUrl]);

    const refreshAuthToken = useCallback(async () => {
        try {
            const response = await axios.post(`${apiUrl}/api/token`, {}, {
                withCredentials: true,
            });
            localStorage.setItem('token', response.data.token);
            return response.data.token;
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    }, [apiUrl]);

    const fetchUserRole = useCallback(async () => {
        let token = localStorage.getItem('token');
        if (!token) {
            token = await refreshAuthToken();
            await setCsrfToken();
        }
        try {
            const response = await axios.get(`${apiUrl}/api/hesap/role`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            setIsAdmin(response.data.role === 'admin');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    token = await refreshAuthToken();
                    await setCsrfToken();
                    const response = await axios.get(`${apiUrl}/api/hesap/role`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });
                    setIsAdmin(response.data.role === 'admin');
                } catch (refreshError) {
                    console.error('Error refreshing token during fetchUserRole:', refreshError);
                }
            } else if (error.response && error.response.status === 403) {
                console.error('Forbidden error, possibly due to CSRF:', error);
                await setCsrfToken();
            } else {
                console.error('Error fetching user role:', error);
            }
        }
    }, [apiUrl, setCsrfToken, refreshAuthToken]);

    useEffect(() => {
        fetchUserRole();
    }, [fetchUserRole]);

    if (!isAdmin) {
        return null;
    }

    const handleAdminNavigate = () => {
        navigate("/admin");
        window.location.reload();
    }

    return (
        <div className="admin-navigate">
            <Link to="#" onClick={handleAdminNavigate}>
                <i className="bi bi-gear"></i>
            </Link>
        </div>
    );
}

export default AdminNavigate;
