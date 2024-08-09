import { useContext } from "react";
import CartItem from "./CartItem";
import { CartContext } from "../../context/CartProvider";

const CartTable = () => {
    const { cartItems } = useContext(CartContext);

    if (cartItems.length === 0) {
        return <div className="empty-cart-message"></div>;
    }

    return (
        <table className="shop-table">
            <thead>
                <tr>
                    <th className="product-thumbnail">&nbsp;</th>
                    <th className="product-thumbnail">&nbsp;</th>
                    <th className="product-name">Ürünler</th>
                    <th className="product-price">Ürün Fiyatı</th>
                    <th className="product-quantity">Ürün Adeti</th>
                    <th className="product-subtotal">Toplam</th>
                </tr>
            </thead>
            <tbody className="cart-wrapper">
                {cartItems.map((cartItem) => (
                    <CartItem cartItem={cartItem} key={cartItem._id || cartItem.id} />
                ))}
            </tbody>
        </table>
    );
}

export default CartTable;
