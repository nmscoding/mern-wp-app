import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { format } from "date-fns";
import "./BlogDetails.css";
import LoadingScreen from "../Loading/LoadingScreen";
import BlogItem from "../Blogs/BlogItem";

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [relatedBlogs, setRelatedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/blogs/${id}`);
                setBlog(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedBlogs = async () => {
            try {
                const response = await axios.get(`${apiUrl}/api/blogs/random/3`);
                setRelatedBlogs(response.data);
            } catch (err) {
                console.error("Error fetching related blogs:", err);
            }
        };

        fetchBlog();
        fetchRelatedBlogs();
    }, [apiUrl, id]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!blog) {
        return <div>No blog found</div>;
    }

    const formattedDate = blog.createdAt ? format(new Date(blog.createdAt), "d MMM yyyy") : "Unknown Date";

    return (
        <section className="single-blog">
            <div className="container">
                <article>
                    <figure>
                        <img src={Array.isArray(blog.img) ? blog.img[0] : blog.img} alt={blog.title} />
                    </figure>
                    <div className="blog-wrapper">
                        <div className="blog-meta">
                            <div className="blog-category">
                                <a href="">{blog.name}</a>
                            </div>
                            <div className="blog-date">
                                <a href="">{formattedDate}</a>
                            </div>
                            <div className="blog-tags">
                                {Array.isArray(blog.tags) ? blog.tags.map(tag => (
                                    <strong key={tag}>{tag}, </strong>
                                )) : <a href="">{blog.tags}</a>}
                            </div>
                        </div>
                        <h1 className="blog-title">{blog.title}</h1>
                        <div className="blog-content">
                            <p>{blog.desc}</p>
                            <blockquote>
                                <p>{blog.blockquote}</p>
                            </blockquote>
                            <p>{blog.subdesc}</p>
                        </div>
                    </div>
                </article>

                {/* İlgili Bloglar */}
                <section className="blogs">
                    <div className="container">
                        <h2>İlgili Bloglar</h2>
                        <ul className="blog-list">
                            {relatedBlogs.map(relatedBlog => (
                                <BlogItem key={relatedBlog._id} blogs={relatedBlog} />
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        </section>
    );
}

export default BlogDetails;
