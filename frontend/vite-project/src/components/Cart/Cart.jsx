import PropTypes from "prop-types";
import Slider from "react-slick";
import CartProgress from './CartProgress';
import CartTable from './CartTable';
import CartCoupon from './CartCoupon';
import CartTotals from './CartTotals';
import Products from '../Products/Products';
import "./Cart.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useContext, useEffect, useState, useCallback } from 'react';
import { CartContext } from "../../context/CartProvider";
import axios from 'axios';
import "../Favorites/Favorites.css";
import LoadingScreen from '../Loading/LoadingScreen';
import ProductItem from "../Products/ProductItem";

function NextBtn({ onClick }) {
    return (
        <button className="glide__arrow glide__arrow--right" onClick={onClick}>
            <i className="bi bi-chevron-right"></i>
        </button>
    );
}

NextBtn.propTypes = {
    onClick: PropTypes.func,
};

function PrevBtn({ onClick }) {
    return (
        <button className="glide__arrow glide__arrow--left" onClick={onClick}>
            <i className="bi bi-chevron-left"></i>
        </button>
    );
}

PrevBtn.propTypes = {
    onClick: PropTypes.func,
};

const Cart = () => {
    const sliderSettings = {
        dots: false,
        infinite: false,
        slidesToShow: 4,
        slidesToScroll: 2,
        nextArrow: <NextBtn />,
        prevArrow: <PrevBtn />,
        autoplaySpeed: 3000,
        autoplay: false,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                },
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

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
        <section className="cart-page">
            <div className="container">
                <div className="cart-page-wrapper">
                    <form className="cart-form">
                        <CartProgress />
                        <div className="shop-table-wrapper">
                            <CartTable />
                        </div>
                    </form>
                    <div className="cart-collaterals">
                        <CartTotals />
                        <CartCoupon />
                    </div>
                </div>
                <div className='recommended-products'>
                    {favoriteItems.length > 0 && (
                        <>
                            <div className="wp-recommended-products-title-wrapper">
                                <h2 className='recommended-products-title'>Favori Ürünlerim </h2>
                                <p>({favoriteItems.length})</p>
                            </div>
                            <div className="products">
                                <div className="product-wrapper glide">
                                    <div className="glide__track">
                                        <Slider {...sliderSettings}>
                                            {favoriteItems.map((product, index) => (
                                                <ProductItem key={product._id || index} productItem={product} onRemove={() => handleRemoveFavorite(product._id)} />
                                            ))}
                                        </Slider>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    <h2 className='recommended-products-title'>Önerilen Ürünler</h2>
                    <Products categoryFilter="Cihazlar" limit={10} />
                </div>
            </div>
        </section>
    );
};

export default Cart;
