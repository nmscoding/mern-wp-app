import PropTypes from "prop-types";
import "./BrandItem.css";

const BrandItem = ({ brand }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <li className="brand-item">
      <a href="">
        <img src={`${apiUrl}/${brand.img}`} alt={brand.name} />
      </a>
    </li>
  );
};

BrandItem.propTypes = {
  brand: PropTypes.shape({
    img: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default BrandItem;
