import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductItem from "../components/Products/ProductItem";
import { message } from "antd";
import "../components/Categories/CategoryProduct.css";
import LoadingScreen from "../components/Loading/LoadingScreen";
import CategoryBreadcrumb from "../components/Categories/CategoryBreadcrumb";

const CategoryProducts = () => {
    const { categoryName } = useParams();
    const [products, setProducts] = useState([]);
    const [singleProduct, setSingleProduct] = useState(null);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [loading, setLoading] = useState(true);
    const [sortOption, setSortOption] = useState("default");

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setSingleProduct(null);
            try {
                let query = `${apiUrl}/api/urun?`;
                if (categoryName && categoryName !== "tumurun") {
                    query += `category=${categoryName}&`;
                }
                query += `sort=${sortOption}`;
                const response = await fetch(query);
                if (!response.ok) {
                    console.error(`API response status: ${response.status}`);
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data);
                setSingleProduct(data.length > 0 ? data[0] : null);
            } catch (error) {
                message.error("Veri getirme başarısız.");
                console.error("Response error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [apiUrl, categoryName, sortOption]);

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <section className="products">
            <div className="container">
                <div className="category-title">
                    <h2>{!categoryName || categoryName === "tumurun" ? "Tüm Ürünler" : `Water Planet Tüm ${categoryName}`}</h2>
                </div>
                <div className="single-product arrangement">
                    <CategoryBreadcrumb singleProduct={singleProduct} isAllProducts={!categoryName || categoryName === "tumurun"} />
                    <select id="sorting" name="sorting" value={sortOption} onChange={handleSortChange}>
                        <option value="default">Varsayılan</option>
                        <option value="rising">Yükselen Fiyat</option>
                        <option value="decreasing">Azalan Fiyat</option>
                        <option value="new">En Yeni</option>
                        <option value="old">En Eski</option>
                        <option value="discount">İndirim Oranı</option>
                    </select>
                </div>
                <div className="product-wrapper">
                    <div className="single-category">
                        <div className="product-list">
                            {products.map((product) => (
                                <ProductItem productItem={product} key={product._id} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoryProducts;
