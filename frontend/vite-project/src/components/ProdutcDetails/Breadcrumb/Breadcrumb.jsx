import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import "./Breadcrumb.css";
import { Link } from "react-router-dom";

const Breadcrumb = ({ singleProduct }) => {
    const [categoryName, setCategoryName] = useState("");
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCategoryName = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/kategori/${singleProduct.category}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                if (data && data.name) {
                    setCategoryName(data.name);
                } else {
                    throw new Error("Kategori adı bulunamadı");
                }
            } catch (error) {
                setError(error.message);
                console.error("Kategori adı alınamadı:", error);
            }
        };

        fetchCategoryName();
    }, [singleProduct.category, apiUrl]);

    if (error) {
        return <div>Hata: {error}</div>;
    }

    if (!categoryName) {
        return <div>Yükleniyor...</div>;
    }

    return (
        <div className="single-topbar">
            <nav className="breadcrumb">
                <ul>
                    <li>
                        <Link to="/">Anasayfa</Link>
                    </li>
                    <li>
                        <Link to="/magaza">Ürünler</Link>
                    </li>
                    <li>
                        <Link to={`/kategori/${categoryName}`}>{categoryName}</Link>
                    </li>
                    <li className="breadcrumb-title">
                        {singleProduct.name}
                    </li>
                </ul>
            </nav>
        </div>
    );
};

Breadcrumb.propTypes = {
    singleProduct: PropTypes.shape({
        category: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired,
};

export default Breadcrumb;
