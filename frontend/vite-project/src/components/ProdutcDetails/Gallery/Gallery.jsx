import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Slider from "react-slick";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import "./Gallery.css";

const baseUrl = import.meta.env.VITE_API_BASE_URL; // API URL'sini ekleyin

function PrevBtn({ onClick }) {
    return (
        <button
            className="glide__arrow glide__arrow--left"
            data-glide-dir="<"
            onClick={onClick}
            style={{
                zIndex: "2",
            }}
        >
            <i className="bi bi-chevron-left"></i>
        </button>
    );
}

function NextBtn({ onClick }) {
    return (
        <button
            className="glide__arrow glide__arrow--right"
            data-glide-dir=">"
            onClick={onClick}
            style={{
                zIndex: "2",
            }}
        >
            <i className="bi bi-chevron-right"></i>
        </button>
    );
}

NextBtn.propTypes = {
    onClick: PropTypes.func,
};

PrevBtn.propTypes = {
    onClick: PropTypes.func,
};

const Gallery = ({ singleProduct }) => {
    const [activeImg, setActiveImg] = useState({
        img: `${baseUrl}${singleProduct.img[0]}`,
        imgIndex: 0,
    });

    useEffect(() => {
        setActiveImg({
            img: `${baseUrl}${singleProduct.img[0]}`,
            imgIndex: 0,
        });
    }, [singleProduct]);

    const sliderSettings = {
        dots: false,
        infinite: false,
        slidesToShow: 5,
        slidesToScroll: 1,
        nextArrow: <NextBtn />,
        prevArrow: <PrevBtn />,
    };

    return (
        <div className="product-gallery">
            <div className="single-image-wrapper">
                <Zoom>
                    <img src={activeImg.img} id="single-image" alt="" style={{ width: '100%' }} />
                </Zoom>
            </div>
            <div className="product-thumb">
                <div className="glide__track" data-glide-el="track">
                    <ol className="gallery-thumbs glide__slides">
                        <Slider {...sliderSettings}>
                            {singleProduct.img.map((itemImg, index) => (
                                <li
                                    className={`glide__slide ${activeImg.imgIndex === index ? "glide__slide--active" : ""}`}
                                    key={index}
                                    onClick={() =>
                                        setActiveImg({
                                            img: `${baseUrl}${itemImg}`,
                                            imgIndex: index,
                                        })
                                    }
                                >
                                    <img
                                        src={`${baseUrl}${itemImg}`}
                                        alt=""
                                        className={`img-fluid ${activeImg.imgIndex === index ? "active" : ""}`}
                                    />
                                </li>
                            ))}
                        </Slider>
                    </ol>
                </div>
                <div className="glide__arrows" data-glide-el="controls"></div>
            </div>
        </div>
    );
};

Gallery.propTypes = {
    singleProduct: PropTypes.object.isRequired,
};

export default Gallery;
