import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import "./BlogItem.css";
import LoadingScreen from "../Loading/LoadingScreen";

const BlogItem = ({ blogs = {} }) => {
    const {
        _id,
        title,
        img,
        createdAt,
    } = blogs;


    if (!_id) {
        return <LoadingScreen />;
    }

    const formattedDate = createdAt ? format(new Date(createdAt), "d MMM yyyy") : "Unknown Date";

    const imageUrl = Array.isArray(img) ? img[0] : img;

    return (
        <li className="blog-item">
            <Link to={`/blogs/${_id}`} className="blog-image">
                <img src={imageUrl} alt={title} />
            </Link>
            <div className="blog-info">
                <div className="blog-info-top">
                    <span>{formattedDate}</span>
                </div>
                <div className="blog-info-center">
                    <Link to={`/blogs/${_id}`}>{title}</Link>
                </div>
                <div className="blog-info-bottom">
                    <Link to={`/blogs/${_id}`}>Yazının Devamı</Link>
                </div>
            </div>
        </li>
    );
};

BlogItem.propTypes = {
    blogs: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        img: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]).isRequired,
        createdAt: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        subdesc: PropTypes.string.isRequired,
        blockquote: PropTypes.string.isRequired,
        tags: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.arrayOf(PropTypes.string)
        ]).isRequired,
    }),
};

export default BlogItem;
