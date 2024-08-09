import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./CategoryItem.css";

const CategoryItem = ({ category }) => {
    return (
        <li className="category-item" data-category={category.name}>
            <Link to={`/kategori/${category.name}`}>
                <img src={category.img} alt={category.name} className="category-image" />
                <span className="category-title">{category.name}</span>
            </Link>
        </li>
    );
};

CategoryItem.propTypes = {
    category: PropTypes.shape({
        name: PropTypes.string.isRequired,
        img: PropTypes.string.isRequired,
    }).isRequired,
};

export default CategoryItem;
