import ProductItem from "../Products/ProductItem";
import { useContext, useEffect, useState, useCallback } from 'react';
import { CartContext } from "../../context/CartProvider";
import axios from 'axios';
import "./Favorites.css";
import LoadingScreen from '../Loading/LoadingScreen';


const FavoriteItem = () => {

    const { favoriteItems, setFavoriteItems } = useContext(CartContext);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [loading, setLoading] = useState(true);

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

    const fetchFavoritesWithRetry = useCallback(async () => {
        let token = localStorage.getItem('token');
        try {
            const response = await axios.get(`${apiUrl}/api/hesap/favorites`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            const favorites = Array.isArray(response.data) ? response.data.filter(item => typeof item === 'object') : [];
            setFavoriteItems(favorites);
            setLoading(false);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    token = await refreshAuthToken();
                    await setCsrfToken();
                    const response = await axios.get(`${apiUrl}/api/hesap/favorites`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });
                    const favorites = Array.isArray(response.data) ? response.data.filter(item => typeof item === 'object') : [];
                    setFavoriteItems(favorites);
                    setLoading(false);
                } catch (refreshError) {
                    console.error('Error refreshing token during fetchFavorites:', refreshError);
                    setFavoriteItems([]);
                    setLoading(false);
                }
            } else if (error.response && error.response.status === 403) {
                console.error('Forbidden error, possibly due to CSRF:', error);
                await setCsrfToken();
                setLoading(false);
            } else {
                console.error('Error fetching favorites:', error);
                setFavoriteItems([]);
                setLoading(false);
            }
        }
    }, [apiUrl, setFavoriteItems, refreshAuthToken, setCsrfToken]);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                await fetchFavoritesWithRetry();
            } catch (error) {
                console.error('Error fetching favorites:', error);
                setFavoriteItems([]);
                setLoading(false);
            }
        };

        fetchFavorites();

        const interval = setInterval(() => {
            setCsrfToken();
        }, 55 * 60 * 1000);

        return () => clearInterval(interval);
    }, [fetchFavoritesWithRetry, setFavoriteItems, setCsrfToken]);



    if (loading) {
        return <LoadingScreen />;
    }

    const handleRemoveFavorite = async (productId) => {
        try {
            await handleRemoveFavoriteWithRetry(productId);
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const handleRemoveFavoriteWithRetry = async (productId) => {
        let token = localStorage.getItem('token');
        try {
            const response = await axios.delete(`${apiUrl}/api/hesap/favorites/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            const updatedFavorites = Array.isArray(response.data) ? response.data.filter(item => typeof item === 'object') : [];
            setFavoriteItems(updatedFavorites);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                try {
                    token = await refreshAuthToken();
                    await setCsrfToken();
                    const response = await axios.delete(`${apiUrl}/api/hesap/favorites/${productId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });

                    const updatedFavorites = Array.isArray(response.data) ? response.data.filter(item => typeof item === 'object') : [];
                    setFavoriteItems(updatedFavorites);
                } catch (refreshError) {
                    console.error('Error refreshing token during remove favorite:', refreshError);
                }
            } else if (error.response && error.response.status === 403) {
                console.error('Forbidden error, possibly due to CSRF:', error);
                await setCsrfToken();
            } else {
                console.error('Error removing favorite:', error);
            }
        }
    };

    return (
        <div className="favorites-product">
            <div className="product-list">
                {favoriteItems.map((product, index) => {
                    if (typeof product !== 'object') {
                        console.error('Invalid product in favorites:', product);
                        return null;
                    }
                    return (
                        <ProductItem
                            key={product._id || index}
                            productItem={product}
                            onRemove={() => handleRemoveFavorite(product._id)}
                        />
                    );
                })}
            </div>
        </div>
    )
}

export default FavoriteItem