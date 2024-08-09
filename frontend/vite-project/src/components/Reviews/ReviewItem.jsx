import PropTypes from "prop-types";
import { message } from 'antd';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const ReviewItem = ({ reviewItem, user, singleProduct, setSingleProduct }) => {
    const { review, user: reviewUser } = reviewItem;
    const { text, createdAt, rating, images, _id: reviewId } = review;
    const options = { year: "numeric", month: "long", day: "numeric" };
    const reviewCreatedAt = new Date(createdAt).toLocaleDateString("tr-TR", options);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    // Kullanıcı ve yorum kullanıcısının kimliklerinin doğruluğunu kontrol et
    const userId = user ? user.id || user._id : null;
    const reviewUserId = reviewUser ? reviewUser._id : null;

    console.log("ReviewItem Component: ");
    console.log("Logged-in User ID:", userId ? userId.toString() : "User not logged in");
    console.log("Review User ID:", reviewUserId ? reviewUserId.toString() : "Review User not found");

    const handleDelete = async () => {
        if (!userId || !reviewUserId || userId.toString() !== reviewUserId.toString()) {
            message.error("Bu yorumu silmeye yetkiniz yok");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const csrfToken = await fetch(`${apiUrl}/csrf-token`, { credentials: "include" }).then(res => res.json()).then(data => data.csrfToken);

            const response = await fetch(`${apiUrl}/api/urun/${singleProduct._id}/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "CSRF-Token": csrfToken,
                },
                credentials: "include",
            });

            if (response.ok) {
                const updatedProduct = await response.json();
                setSingleProduct(updatedProduct);
                message.success("Yorum başarıyla silindi");
            } else {
                message.error("Yorum silinirken hata oluştu");
            }
        } catch (error) {
            console.error("Yorum silinirken hata oluştu:", error);
            message.error("Yorum silinirken hata oluştu");
        }
    };

    const maskName = (name) => {
        if (!name) return "";
        return name[0] + "*".repeat(name.length - 1);
    };

    return (
        <li className="comment-item">
            <div className="comment-text">
                <ul className="comment-star">
                    {Array.from({ length: 5 }, (_, index) => (
                        <li key={index}>
                            <i className={`bi bi-star-fill ${index < rating ? "gold" : ""}`}></i>
                        </li>
                    ))}
                </ul>
                <div className="comment-meta">
                    <strong>{maskName(reviewUser.name)} {maskName(reviewUser.surname)}</strong>
                    <span> - </span>
                    <time dateTime="">{reviewCreatedAt}</time>
                </div>
                <div className="comment-description">
                    <p>{text}</p>
                    <div className="review-image">
                        {images && images.map((image, index) => (
                            <Zoom key={index}>
                                <img src={`${apiUrl}${image}`} alt="" className="zoomable-image" />
                            </Zoom>
                        ))}
                    </div>
                </div>
                {userId && reviewUserId && userId.toString() === reviewUserId.toString() && (
                    <button onClick={handleDelete} className="delete-review">
                        <i className="bi bi-trash"></i> Sil
                    </button>
                )}
            </div>
        </li>
    );
};

ReviewItem.propTypes = {
    reviewItem: PropTypes.shape({
        review: PropTypes.shape({
            text: PropTypes.string.isRequired,
            createdAt: PropTypes.string.isRequired,
            rating: PropTypes.number.isRequired,
            images: PropTypes.arrayOf(PropTypes.string),
            _id: PropTypes.string.isRequired,
        }).isRequired,
        user: PropTypes.shape({
            name: PropTypes.string.isRequired,
            surname: PropTypes.string.isRequired,
            _id: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    user: PropTypes.shape({
        id: PropTypes.string,
        _id: PropTypes.string,
    }),
    singleProduct: PropTypes.object.isRequired,
    setSingleProduct: PropTypes.func.isRequired,
};

export default ReviewItem;
