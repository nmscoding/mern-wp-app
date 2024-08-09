import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../../context/CartProvider';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './ProductItem.css';
import ShareModal from '../Modals/Share/ShareModal';

const ProductItem = ({ productItem }) => {
    const { cartItems, addToCart, addToFavorites, removeFromFavorites, favoriteItems } = useContext(CartContext);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    useEffect(() => {
        if (favoriteItems.some(item => item._id === productItem._id)) {
            setIsFavorite(true);
        } else {
            setIsFavorite(false);
        }
    }, [favoriteItems, productItem._id]);

    if (!productItem || typeof productItem !== 'object' || !productItem.price || !productItem.price.newprice) {
        console.error('Invalid productItem:', productItem);
        return null;
    }

    const handleFavoriteClick = async () => {
        if (isFavorite) {
            await removeFromFavorites(productItem._id);
        } else {
            await addToFavorites(productItem);
        }
        setIsFavorite(!isFavorite);
    };

    const handleShareClick = () => {
        setIsShareModalOpen(true);
    };

    const originalPrice = productItem.price.newprice;
    const discountPercentage = productItem.price.discount || 0;
    const discountPrice = originalPrice + (originalPrice * discountPercentage) / 100;

    const baseUrl = window.location.origin;
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://waterplanet.store';
    const imageUrl = `${apiUrl}${productItem.img && productItem.img[0] ? productItem.img[0] : ''}`;
    const productUrl = `${baseUrl}/urun/${productItem._id}`;

    const reviewCount = productItem.reviews ? productItem.reviews.length : 0;
    const averageRating = productItem.reviews && reviewCount > 0
        ? productItem.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
        : 0;

    return (
        <div className="product-item glide__slide">
            <div className="product-image">
                <Link to={`/urun/${productItem._id}`} className="product-link">
                    <img src={imageUrl} alt={productItem.name} className="product-img" />
                </Link>
                {productItem.price.discount >= 30 && productItem.price.discount <= 40 && (
                    <img src="/images/sales2.png" alt="Sale" className="product-sales" />
                )}
                {productItem.price.discount >= 22 && productItem.price.discount <= 25 && (
                    <img src="/images/sales.png" alt="Sale" className="product-sales" />
                )}
            </div>
            <div className="product-info">
                <Link to={`/urun/${productItem._id}`} className="product-title product-link">
                    {productItem.name}
                </Link>
                <ul className="product-star">
                    {Array.from({ length: 5 }, (_, index) => {
                        if (index < Math.floor(averageRating)) {
                            return (
                                <li key={index}>
                                    <i className="bi bi-star-fill gold"></i>
                                </li>
                            );
                        } else if (index < Math.ceil(averageRating)) {
                            return (
                                <li key={index} className="half">
                                    <i className="bi bi-star-half gold"></i>
                                </li>
                            );
                        } else {
                            return (
                                <li key={index}>
                                    <i className="bi bi-star-fill"></i>
                                </li>
                            );
                        }
                    })}
                    <span> ({reviewCount})</span>
                </ul>
                <div className="product-prices">
                    <strong className="new-price">
                        ₺{productItem.price.newprice.toFixed(2)}
                    </strong>
                    {productItem.price.discount && productItem.price.discount > 0 ? (
                        <span className="old-price">
                            ₺{discountPrice.toFixed(2)}
                        </span>
                    ) : null}
                </div>
                <button
                    className="add-to-cart-button"
                    onClick={() => addToCart(productItem)}
                    disabled={cartItems.some(cartItem => cartItem._id === productItem._id)}
                >
                    Sepete Ekle
                </button>
                <div className="product-avantage">
                    {productItem.price.discount && productItem.price.discount > 0 ? (
                        <span className="product-discount">%{productItem.price.discount}</span>
                    ) : null}
                </div>
                <div className="product-links">
                    <button
                        className="add-to-cart"
                        onClick={() => addToCart(productItem)}
                        disabled={cartItems.some(cartItem => cartItem._id === productItem._id)}
                    >
                        <i className="bi bi-basket-fill"></i>
                    </button>
                    <button className="add-to-favorites" onClick={handleFavoriteClick}>
                        <i className={`bi ${isFavorite ? 'bi-trash' : 'bi-heart-fill'}`}></i>
                    </button>
                    <Link to={`urun/${productItem._id}`} className="product-link">
                        <i className="bi bi-eye-fill"></i>
                    </Link>
                    <button type="button" onClick={handleShareClick}>
                        <i className="bi bi-share-fill"></i>
                    </button>
                </div>
            </div>
            <ShareModal
                isOpen={isShareModalOpen}
                onRequestClose={() => setIsShareModalOpen(false)}
                shareUrl={productUrl}
            />
        </div>
    );
};

ProductItem.propTypes = {
    productItem: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        img: PropTypes.arrayOf(PropTypes.string).isRequired,
        name: PropTypes.string.isRequired,
        price: PropTypes.shape({
            newprice: PropTypes.number.isRequired,
            discount: PropTypes.number,
        }).isRequired,
        reviews: PropTypes.arrayOf(
            PropTypes.shape({
                rating: PropTypes.number.isRequired,
            })
        ),
    }).isRequired,
};

export default ProductItem;
