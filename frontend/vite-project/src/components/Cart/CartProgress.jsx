import { useContext } from "react";
import { CartContext } from "../../context/CartProvider";

const CartProgress = () => {
    const { cartItems } = useContext(CartContext);

    const cartItemTotals = cartItems.map((item) => {
        const itemTotal = item.price.newprice * item.quantity;
        return itemTotal;
    });

    const subTotals = cartItemTotals.reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
    }, 0);

    const freeShippingThreshold = 400;
    const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subTotals);
    const progressPercentage = Math.min((1 - remainingForFreeShipping / freeShippingThreshold) * 100, 100);


    let progressBarColor = 'red'; 
    let progressBarText = `Ücretsiz Kargo İçin ₺${remainingForFreeShipping.toFixed(2)}` + '`lik Ürün Daha Ekle';
    
    if (progressPercentage >= 100) {
        progressBarColor = 'green';
        progressBarText = 'Kargo Bedava';
    } else if (progressPercentage > 80) {
        progressBarColor = 'yellow';
    }

    return (
        <div className="free-progress-bar">
            <p className="progress-bar-title">
                {progressBarText}
            </p>
            <div className="progress-bar">
                <span 
                    className="progress" 
                    style={{ width: `${progressPercentage}%`, backgroundColor: progressBarColor }}
                ></span>
            </div>
        </div>
    );
};

export default CartProgress;
