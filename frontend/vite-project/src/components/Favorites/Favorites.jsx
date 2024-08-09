import { useContext } from 'react';
import { CartContext } from "../../context/CartProvider";
import FavoriteItem from './FavoriteItem'
import "./Favorites.css";



const Favorites = () => {

    const { favoriteItems } = useContext(CartContext);
    

    return (
        <section className="products">
            <div className="container">
                <div className="section-title-start">
                    <button>
                        <h2>Favorilerim</h2>
                        <i className="bi bi-heart-fill"></i>
                    </button>
                    <p className='wp-favorites-number-of-products'>{favoriteItems.length} ürün</p>
                </div>
                <div className="favorite-product-wrapper">
                    <div className="product-wrapper">
                        <FavoriteItem />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Favorites;
