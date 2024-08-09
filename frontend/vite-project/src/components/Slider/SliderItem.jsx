import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const SliderItem = ({ title, subtitle, imageSrc, productId }) => {
    return (
        <div className="slider-item fade">
            <div className="slider-left">
                <div className="slider-container">
                    <p className="slider-title">{title}</p>
                    <h2 className="slider-heading">{subtitle}</h2>
                    {productId && <Link to={`/urun/${productId}`} className="btn btn-lg btn-primary">ŞİMDİ İNCELE</Link>}
                </div>
            </div>
            <div className="slider-right">
                <div className="slider-image">
                    {productId ? (
                        <Link to={`/urun/${productId}`}>
                            <img src={imageSrc} className="img-fluid" alt="Slider Image" />
                        </Link>
                    ) : (
                        <img src={imageSrc} className="img-fluid" alt="Slider Image" />
                    )}
                </div>
            </div>
        </div>
    );
};

SliderItem.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    imageSrc: PropTypes.string.isRequired,
    productId: PropTypes.string,
};

export default SliderItem;
