import PropTypes from "prop-types";
import "./CampaignItem.css";

const CampaignItem = ({ title, desc, img }) => {
    const style = {
        backgroundImage: `url(${img})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div className="campaign-item" style={style}>
            <h3 className="campaign-title">{title}</h3>
            <p className="campaign-desc">{desc}</p>
        </div>
    );
}

CampaignItem.propTypes = {
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired,
};

export default CampaignItem;
