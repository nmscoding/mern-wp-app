import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import "./Blogs.css";
import BlogItem from "./BlogItem";
import LoadingScreen from "../Loading/LoadingScreen";

const Blogs = ({ limit }) => {
    const [blogData, setBlogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/blogs`);
                const data = response.data.map(blog => ({
                    ...blog,
                    img: Array.isArray(blog.img) ? blog.img[0] : blog.img
                }));
                setBlogData(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!Array.isArray(blogData)) {
        return <div>No blogs available</div>;
    }

    return (
        <section className="blogs">
            <div className="container">
                <div className="section-title">
                    <h2>Blog</h2>
                    <p>Su Arıtma ve Ürünlerimiz Hakkında Her Şeyi Öğrenin.</p>
                </div>
                <ul className="blog-list">
                    {blogData.slice(0, limit).map((blog) => (
                        <BlogItem key={blog._id} blogs={blog} />
                    ))}
                </ul>
            </div>
        </section>
    );
}

Blogs.propTypes = {
    limit: PropTypes.number
};

export default Blogs;
