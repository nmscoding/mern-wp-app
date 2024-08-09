import { useEffect, useState } from "react";
import "./Brands.css";
import BrandItem from "./BrandItem";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/brands`);
        if (response.ok) {
          const data = await response.json();
          setBrands(data);
        } else {
          console.error("Markalar getirilemedi.");
        }
      } catch (error) {
        console.error("Bir hata oluştu:", error);
      }
    };

    fetchBrands();
  }, [apiUrl]);

  return (
    <section className="brands">
      <div className="container">
        <ul className="brand-list">
          {brands.map((brand) => (
            <BrandItem key={brand._id} brand={brand} />
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Brands;
