import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Slider from "react-slick";
import { message } from "antd";
import ProductItem from "./ProductItem";
import "./Product.css";

function NextBtn({ onClick }) {
  return (
    <button className="glide__arrow glide__arrow--right" onClick={onClick}>
      <i className="bi bi-chevron-right"></i>
    </button>
  );
}

NextBtn.propTypes = {
  onClick: PropTypes.func,
};

function PrevBtn({ onClick }) {
  return (
    <button className="glide__arrow glide__arrow--left" onClick={onClick}>
      <i className="bi bi-chevron-left"></i>
    </button>
  );
}

PrevBtn.propTypes = {
  onClick: PropTypes.func,
};

const Products = ({ categoryFilter = null, limit = null, skip = null, showTitle = false, title = "Popüler Ürünler", topViews = false }) => {
  const [products, setProducts] = useState([]);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let query = "";
        if (topViews) {
          query = `${apiUrl}/api/urun/top-views`;
          console.log("Fetching top viewed products from:", query);
        } else if (categoryFilter) {
          query = `${apiUrl}/api/urun?category=${categoryFilter}`;
          if (skip) query += `&skip=${skip}`;
          if (limit) query += `&limit=${limit}`;
        } else {
          query = `${apiUrl}/api/urun`;
          if (skip) query += `?skip=${skip}`;
          if (limit) query += `${skip ? '&' : '?'}limit=${limit}`;
        }

        const response = await fetch(query);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          const errorData = await response.json();
          console.error("Error fetching products:", errorData);
          message.error("Veri getirme başarısız.");
        }
      } catch (error) {
        console.log("Veri hatası:", error);
      }
    };

    fetchProducts();
  }, [apiUrl, categoryFilter, skip, limit, topViews]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <NextBtn />,
    prevArrow: <PrevBtn />,
    autoplaySpeed: 3000,
    autoplay: true,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="products" id="products">
      <div className="container">
        {showTitle && (
          <div className="section-title">
            <h2>{title}</h2>
            <a href="/tumurun">Tüm Ürünler</a>
          </div>
        )}
        <div className="product-wrapper glide">
          <div className="glide__track">
            <Slider {...sliderSettings}>
              {products.map((product) => (
                <ProductItem productItem={product} key={product._id} />
              ))}
            </Slider>
          </div>
          <div className="glide__arrows"></div>
        </div>
      </div>
    </section>
  );
};

Products.propTypes = {
  categoryFilter: PropTypes.string,
  limit: PropTypes.number,
  skip: PropTypes.number,
  showTitle: PropTypes.bool,
  title: PropTypes.string,
  topViews: PropTypes.bool,
};

export default Products;
