import PropTypes from "prop-types";
import { useContext } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate'i ekleyin
import { CartContext } from "../../context/CartProvider";

const CartItem = ({ cartItem }) => {
    const { removeFromCart, updateCartQuantity } = useContext(CartContext);
    const navigate = useNavigate();

    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const imageUrl = `${baseUrl}${cartItem.img[0]}`;

    const price = cartItem.price.newprice !== undefined ? cartItem.price.newprice : cartItem.price.originalprice;

    const goToProductDetails = () => {
        navigate(`/urun/${cartItem.id}`);
    };

    return (
        <tr className="cart-item">
            <td></td>
            <td className="cart-image">
                <img src={imageUrl} alt={cartItem.name} onClick={goToProductDetails} style={{ cursor: "pointer" }} />
            </td>
            <td onClick={goToProductDetails} style={{ cursor: "pointer" }}>{cartItem.name}</td>
            <td>₺{price !== undefined && price !== null ? price.toFixed(2) : '0.00'}</td>
            <td className="product-quantity">
                <input 
                    type="number" 
                    value={cartItem.quantity} 
                    min="1" 
                    onChange={(e) => updateCartQuantity(cartItem.id, parseInt(e.target.value))}
                />
            </td>
            <td className="product-subtotal">
                <strong>
                    ₺{price !== undefined && price !== null ? (price * cartItem.quantity).toFixed(2) : '0.00'}
                </strong>
            </td>
            <td>
                <i
                    className="bi bi-trash"
                    onClick={() => {
                        console.log("Removing item with ID:", cartItem.id);
                        removeFromCart(cartItem.id);
                    }}
                >
                </i>
                <span className="remove-text" onClick={() => {
                    console.log("Removing item with ID:", cartItem.id);
                    removeFromCart(cartItem.id);
                }}>Sil</span>
            </td>
        </tr>
    );
}

CartItem.propTypes = {
    cartItem: PropTypes.shape({
        _id: PropTypes.string,
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        img: PropTypes.arrayOf(PropTypes.string).isRequired,
        name: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        price: PropTypes.shape({
            newprice: PropTypes.number,
            originalprice: PropTypes.number,
        }).isRequired,
        quantity: PropTypes.number.isRequired,
    }).isRequired,
};

export default CartItem;
