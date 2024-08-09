import { useParams } from 'react-router-dom';
import ProductDetails from '../components/ProdutcDetails/ProductDetails';
import { useEffect, useState } from 'react';
import LoadingScreen from '../components/Loading/LoadingScreen';

const ProductDetailsPage = () => {
  const [singleProduct, setSingleProduct] = useState(null);
  const { id: productId } = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/urun/${productId}`);

        if (!response.ok) {
          throw new Error("Verileri getirme hatası");
        }

        const data = await response.json();
        setSingleProduct(data);
      } catch (error) {
        console.log("Veri hatası:", error);
      }
    };
    fetchSingleProduct();
  }, [apiUrl, productId]);

  console.log(singleProduct);

  return singleProduct ? (
    <ProductDetails singleProduct={singleProduct} setSingleProduct={setSingleProduct} />
  ) : (
    <LoadingScreen />
  );
};

export default ProductDetailsPage;
