import { useEffect, useState } from "react";
import "./Categories.css";
import CategoryItem from "./CategoryItem";
import { message } from "antd";
import LoadingScreen from "../Loading/LoadingScreen";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${apiUrl}/api/kategori`);
                if (response.ok) {
                    const data = await response.json();
                    setCategories(data);
                    setLoading(false);
                } else {
                    message.error("Veri getirme başarısız.");
                    setLoading(false);
                }
            } catch (error) {
                console.log("Veri hatası:", error);
                setLoading(false);
            }
        };
        fetchCategories();
    }, [apiUrl]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <section className="categories" id="categories">
            <div className="container">
                <div className="section-title">
                    <h2>Kategoriler</h2>
                </div>
                <ul className="category-list">
                    {categories.map((category) => (
                        <CategoryItem key={category._id} category={category} />
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default Categories;
