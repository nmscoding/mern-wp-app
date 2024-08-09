import React from "react";
import Categories from "../components/Categories/Categories";
import Products from "../components/Products/Products";
import CampaignSingle from "../components/CampaignSingle/CampaignSingle";

const ShopPage = () => {
  return (
    <React.Fragment>
      <Categories />
      <Products limit={6} showTitle={true} title="Yeni Ürünler"/>
      <Products skip={6} limit={6} />
      <CampaignSingle />
      <Products categoryFilter="Filtreler" limit={10} showTitle={true} title="Süper Fırsat, Süper Fiyat" />
      <Products />
    </React.Fragment>
  );
};

export default ShopPage;
