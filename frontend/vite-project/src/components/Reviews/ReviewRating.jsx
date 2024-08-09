import { useEffect, useState } from 'react';
import PropTypes from "prop-types";
import './Reviews.css';

const ReviewRating = ({ singleProduct, reviewId }) => {
    const [reviews, setReviews] = useState([]);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/urun/${singleProduct._id}/reviews`);
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        if (singleProduct && reviewId) {
            fetchReviews();
        }
    }, [apiUrl, singleProduct, reviewId]);

    const calculateProgressWidth = (rating, totalReviews) => {
        return totalReviews > 0 ? (rating / totalReviews) * 100 : 0;
    };

    const totalReviews = reviews.length;
    const ratingsCount = [0, 0, 0, 0, 0];

    reviews.forEach(review => {
        ratingsCount[review.rating - 1]++;
    });

    const averageRating = totalReviews > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) : 0;

    return (
        <div className='review-rating-summary'>
            <h4>Yorum Değerlendirme Özeti</h4>
            <p>Doğrulanmış Değerlendirmeler</p>
            <div className="review-rating-summary-wrapper">
                <div className="rating-summary">
                    {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="free-progress-bar">
                            <p className='rating-summary-point'>{star}</p>
                            <div className="progress-bar">
                                <span className="progress" style={{ width: `${calculateProgressWidth(ratingsCount[star - 1], totalReviews)}%` }}></span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="review-rating-number">
                    <span>{averageRating}</span>
                    <div className='review-rating-number-star'>
                        <ul>
                        {Array.from({ length: 5 }, (_, index) => (
                            <li key={index}>
                                <i className={`bi bi-star-fill ${index < averageRating ? "gold" : ""}`}></i>
                            </li>
                        ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

ReviewRating.propTypes = {
    singleProduct: PropTypes.shape({
        _id: PropTypes.string.isRequired,
    }).isRequired,
    reviewId: PropTypes.string.isRequired,
};

export default ReviewRating;
