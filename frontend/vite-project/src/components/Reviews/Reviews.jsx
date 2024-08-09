import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import PropTypes from "prop-types";
import "./Reviews.css";
import { message } from 'antd';
import ReviewRating from './ReviewRating';

const Reviews = ({ active, singleProduct, setSingleProduct, user }) => {
    const [users, setUsers] = useState([]);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const currentUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : user;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/users`);
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else {
                    message.error("Veri başarısız.");
                    console.error(`Error ${response.status}: ${response.statusText}`);
                }
            } catch (error) {
                console.log("Veri hatası:", error);
            }
        };
        fetchUsers();
    }, [apiUrl]);

    const thisReview = singleProduct.reviews.map((review) => {
        const matchingUser = users.find((user) => user._id === review.user.toString());
        return matchingUser ? { review, user: matchingUser } : null;
    }).filter((item) => item !== null);

    const userReviews = thisReview.filter(item => item.user._id === (currentUser.id || currentUser._id));
    const otherReviews = thisReview.filter(item => item.user._id !== (currentUser.id || currentUser._id));

    const allReviews = [...userReviews, ...otherReviews];

    const reviewCount = singleProduct.reviews.length;
    const reviewHeader = reviewCount > 1 ? `${reviewCount} yorum` : `${reviewCount} Yorum`;

    const hasReviewed = currentUser && singleProduct.reviews.some(
        (review) => review.user === (currentUser.id || currentUser._id.toString())
    );

    return (
        <React.Fragment>
            <div className={`tab-panel-reviews ${active}`}>
                {reviewCount > 0 ? (
                    <>
                        <div className='review-title-rating'>
                            <h3>{reviewHeader} {singleProduct.name} ürünü için.</h3>
                            <ReviewRating singleProduct={singleProduct} reviewId={singleProduct._id} />
                        </div>
                        <div className="comments">
                            <ol className="comment-list">
                                {allReviews.map((item, index) => (
                                    <ReviewItem key={index} reviewItem={item} singleProduct={singleProduct} setSingleProduct={setSingleProduct} user={currentUser} />
                                ))}
                            </ol>
                        </div>
                    </>
                ) : (
                    <h3>Hiç yorum yok...</h3>
                )}
                {currentUser ? (
                    !hasReviewed ? (
                        <div className="review-form-wrapper">
                            <h2>Yorum Ekle</h2>
                            <ReviewForm singleProduct={singleProduct} setSingleProduct={setSingleProduct} user={currentUser} />
                        </div>
                    ) : (
                        <p>Yorumunuzu zaten eklediniz.</p>
                    )
                ) : (
                    <div className="login-for-reviews">
                        <p>Yorum yapmak için giriş yapmanız gerekmektedir.</p>
                        <Link to="/hesap"><button className='btn btn-primary btn-sm'>Giriş Yap</button></Link>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};

Reviews.propTypes = {
    active: PropTypes.string,
    singleProduct: PropTypes.object.isRequired,
    setSingleProduct: PropTypes.func.isRequired,
    user: PropTypes.object,
};

export default Reviews;
