import React from "react";
import Sliders from "../components/Slider/Sliders";
import Categories from "../components/Categories/Categories";
import Products from "../components/Products/Products.jsx";
import Campaigns from "../components/Campaigns/Campaigns";
import Blogs from "../components/Blogs/Blogs";
import Brands from "../components/Brands/Brands";
import CampaignSingle from "../components/CampaignSingle/CampaignSingle";

const HomePage = () => {
  return (
    <React.Fragment>
      <Sliders />
      <Categories />
      <Products showTitle={true} title="Popüler Ürünler" topViews={true} limit={10}/>
      <Campaigns />
      <Products categoryFilter="Filtreler" limit={8} />
      <Blogs limit={3} />
      <Brands />
      <CampaignSingle />
    </React.Fragment>
  );
};

export default HomePage;
