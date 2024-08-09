import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import "../ProdutcDetails/Breadcrumb/Breadcrumb.css";
import { Link } from "react-router-dom";

const CategoryBreadcrumb = ({ singleProduct, isAllProducts }) => {
    const [categoryName, setCategoryName] = useState("");
    const [error, setError] = useState(null);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (isAllProducts) {
            setCategoryName("Tüm Ürünler");
            return;
        }

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

        if (singleProduct && singleProduct.category) {
            fetchCategoryName();
        }
    }, [singleProduct, apiUrl, isAllProducts]);

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
                        {categoryName === "Tüm Ürünler" ? "Tüm Ürünler" : `Water Planet ${categoryName}`}
                    </li>
                </ul>
            </nav>
        </div>
    );
};

CategoryBreadcrumb.propTypes = {
    singleProduct: PropTypes.shape({
        category: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }),
    isAllProducts: PropTypes.bool,
};

CategoryBreadcrumb.defaultProps = {
    singleProduct: null,
    isAllProducts: false,
};

export default CategoryBreadcrumb;
