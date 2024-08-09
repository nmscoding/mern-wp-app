import { createContext, useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import axios from 'axios';

export const CartContext = createContext();

const CartProvider = ({ children }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    const [cartItems, setCartItems] = useState(
        localStorage.getItem("cartItems")
            ? JSON.parse(localStorage.getItem("cartItems"))
            : []
    );

    const [favoriteItems, setFavoriteItems] = useState([]);
    const [couponDiscount, setCouponDiscount] = useState(
        localStorage.getItem("couponDiscount")
            ? JSON.parse(localStorage.getItem("couponDiscount"))
            : { value: 0, type: null }
    );
    const [discountedTotal, setDiscountedTotal] = useState(null);
    const [appliedCoupon, setAppliedCoupon] = useState("");

    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem("couponDiscount", JSON.stringify(couponDiscount));
    }, [couponDiscount]);

    const addToCart = (cartItem, quantity) => {
        setCartItems((prevCart) => {
            const existingItem = prevCart.find(item => item.id === cartItem.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.id === cartItem.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                return [
                    ...prevCart,
                    {
                        ...cartItem,
                        id: cartItem.id || cartItem._id,
                        quantity: quantity ? quantity : 1,
                    },
                ];
            }
        });
    };

    const removeFromCart = (itemId) => {
        const filteredCartItems = cartItems.filter((cartItem) => cartItem.id !== itemId);
        setCartItems(filteredCartItems);
    };

    const resetPrices = () => {
        setCartItems((prevCart) =>
            prevCart.map((item) => ({
                ...item,
                price: { ...item.price, newprice: item.price.originalprice },
            }))
        );
    };

    const updateCartQuantity = (itemId, newQuantity) => {
        setCartItems((prevCart) =>
            prevCart.map((item) =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const addToFavorites = async (product) => {
        const token = localStorage.getItem('token');
        try {
            const csrfToken = await getCsrfToken();
            await axios.post(`${apiUrl}/api/hesap/favorites`, { productId: product._id }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken,
                },
                withCredentials: true,
            });
            setFavoriteItems((prevFavorites) => [...prevFavorites, product]);
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };

    const removeFromFavorites = async (productId) => {
        const token = localStorage.getItem('token');
        try {
            const csrfToken = await getCsrfToken();
            await axios.delete(`${apiUrl}/api/hesap/favorites/${productId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken,
                },
                withCredentials: true,
            });
            setFavoriteItems((prevFavorites) => prevFavorites.filter(item => item._id !== productId));
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    const clearCart = () => {
        setCartItems([]);
        setCouponDiscount({ value: 0, type: null });
        setAppliedCoupon("");
    };

    const getCsrfToken = useCallback(async () => {
        try {
            const response = await axios.get(`${apiUrl}/csrf-token`, {
                withCredentials: true,
            });
            return response.data.csrfToken;
        } catch (error) {
            console.error("Error fetching CSRF token:", error);
            return null;
        }
    }, [apiUrl]);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                setCartItems,
                addToCart,
                removeFromCart,
                updateCartQuantity,
                favoriteItems,
                setFavoriteItems,
                addToFavorites,
                removeFromFavorites,
                couponDiscount,
                setCouponDiscount,
                resetPrices,
                clearCart,
                discountedTotal,
                setDiscountedTotal,
                appliedCoupon,
                setAppliedCoupon
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node,
};

export default CartProvider;
