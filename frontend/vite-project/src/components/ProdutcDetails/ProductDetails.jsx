import React, { useEffect } from 'react';
import PropTypes from "prop-types";
import Breadcrumb from "./Breadcrumb/Breadcrumb";
import Gallery from './Gallery/Gallery';
import Info from './Info/Info';
import Tabs from './Tabs/Tabs';
import "./ProductDetails.css";

const ProductDetails = ({ singleProduct, setSingleProduct }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const incrementViewCount = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/urun/${singleProduct._id}`);
        if (!response.ok) {
          throw new Error("Failed to increment view count");
        }
        const updatedProduct = await response.json();
        setSingleProduct(updatedProduct);
      } catch (error) {
        console.error("Error incrementing view count:", error);
      }
    };

    incrementViewCount();
  }, [singleProduct._id, apiUrl, setSingleProduct]);

  return (
    <React.Fragment>
      <section className="single-product">
        <div className="container">
          <div className="single-product-wrapper">
            <Breadcrumb singleProduct={singleProduct} />
            <div className="single-content">
              <main className="site-main">
                <Gallery singleProduct={singleProduct} />
                <Info singleProduct={singleProduct} />
              </main>
            </div>
            <Tabs singleProduct={singleProduct} setSingleProduct={setSingleProduct} />
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

ProductDetails.propTypes = {
  singleProduct: PropTypes.object.isRequired,
  setSingleProduct: PropTypes.func,
};

export default ProductDetails;
