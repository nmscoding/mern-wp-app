import { Layout, Menu } from "antd";
import PropTypes from "prop-types";
import {
    UserOutlined,
    LaptopOutlined,
    RollbackOutlined,
    TagsOutlined,
    DashboardOutlined,
    ShoppingCartOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    MailOutlined,
    MessageOutlined,
    GiftOutlined,
    PictureOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider, Header, Content } = Layout;

const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user ? user.role : null;
};

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const userRole = getUserRole();

    const menuItems = [
        {
            key: "1",
            icon: <DashboardOutlined />,
            label: "Dashboard",
            onClick: () => {
                navigate(`/admin`);
            },
        },
        {
            key: "2",
            icon: <AppstoreOutlined />,
            label: "Kategoriler",
            children: [
                {
                    key: "3",
                    label: "Kategori Listesi",
                    onClick: () => {
                        navigate(`/admin/kategori`);
                    },
                },
                {
                    key: "4",
                    label: "Yeni Kategori Oluştur",
                    onClick: () => {
                        navigate("/admin/kategori/create");
                    },
                },
            ],
        },
        {
            key: "5",
            icon: <LaptopOutlined />,
            label: "Ürünler",
            children: [
                {
                    key: "6",
                    label: "Ürün Listesi",
                    onClick: () => {
                        navigate(`/admin/urun`);
                    },
                },
                {
                    key: "7",
                    label: "Yeni Ürün Oluştur",
                    onClick: () => {
                        navigate("/admin/urun/create");
                    },
                },
            ],
        },
        {
            key: "8",
            icon: <GiftOutlined />,
            label: "Kuponlar",
            children: [
                {
                    key: "9",
                    label: "Kupon Listesi",
                    onClick: () => {
                        navigate(`/admin/coupons`);
                    },
                },
                {
                    key: "10",
                    label: "Yeni Kupon Oluştur",
                    onClick: () => {
                        navigate("/admin/coupons/create");
                    },
                },
            ],
        },
        {
            key: "11",
            icon: <UserOutlined />,
            label: "Kullanıcı Listesi",
            onClick: () => {
                navigate(`/admin/users`);
            },
        },
        {
            key: "12",
            icon: <ShoppingCartOutlined />,
            label: "Siparişler",
            onClick: () => {
                navigate(`/admin/siparis`);
            },
        },
        {
            key: "13",
            icon: <AppstoreOutlined />,
            label: "Markalar",
            children: [
                {
                    key: "14",
                    label: "Marka Listesi",
                    onClick: () => {
                        navigate(`/admin/brands`);
                    },
                },
                {
                    key: "15",
                    label: "Yeni Marka Oluştur",
                    onClick: () => {
                        navigate("/admin/brands/create");
                    },
                },
            ],
        },
        {
            key: "24",
            icon: <PictureOutlined />,
            label: "Slider",
            children: [
                {
                    key: "25",
                    label: "Slider Listesi",
                    onClick: () => {
                        navigate(`/admin/sliders`);
                    },
                },
                {
                    key: "26",
                    label: "Yeni Slider Oluştur",
                    onClick: () => {
                        navigate("/admin/sliders/create");
                    },
                },
            ],
        },
        {
            key: "16",
            icon: <TagsOutlined />,
            label: "Kampanyalar",
            children: [
                {
                    key: "17",
                    label: "Kampanya Listesi",
                    onClick: () => {
                        navigate(`/admin/campaigns`);
                    },
                },
                {
                    key: "18",
                    label: "Yeni Kampanya Oluştur",
                    onClick: () => {
                        navigate("/admin/campaigns/create");
                    },
                },
            ],
        },
        {
            key: "28",
            icon: <TagsOutlined />,
            label: "Ürün Kampanyası",
            children: [
                {
                    key: "29",
                    label: "Mevcut Kampanya",
                    onClick: () => {
                        navigate(`/admin/productcampaign`);
                    },
                },
                {
                    key: "30",
                    label: "Yeni Ürün Kampanyası Oluştur",
                    onClick: () => {
                        navigate("/admin/productcampaign/create");
                    },
                },
            ],
        },
        {
            key: "19",
            icon: <FileTextOutlined />,
            label: "Bloglar",
            children: [
                {
                    key: "20",
                    label: "Blog Listesi",
                    onClick: () => {
                        navigate(`/admin/blogs`);
                    },
                },
                {
                    key: "21",
                    label: "Yeni Blog Oluştur",
                    onClick: () => {
                        navigate(`/admin/blogs/create`);
                    },
                },
            ],
        },
        {
            key: "22",
            icon: <MailOutlined />,
            label: "İletişim Listesi",
            onClick: () => {
                navigate("/admin/contacts");
            },
        },
        {
            key: "23",
            icon: <MessageOutlined />,
            label: "Yorumlar",
            onClick: () => {
                navigate(`/admin/reviews`);
            },
        },
        {
            key: "27",
            icon: <RollbackOutlined />,
            label: "Ana Sayfaya Git",
            onClick: () => {
                window.location.href = "/";
            },
        },
    ];

    if (userRole === "admin") {
        return (
            <div className="admin-layout">
                <Layout
                    style={{
                        minHeight: "100vh",
                    }}
                >
                    <Sider width={200} style={
                        {
                            backgroundColor: "#13c6fb",

                        }

                    }>
                        <div style={{
                            display: "flex",
                        }}>
                            <img src="/images/logo.png" alt="" style={{
                                backgroundColor: "white",
                                width: "80px",
                                height:"40px"
                            }} />
                            <h2 style={{
                                backgroundColor: "white",
                                width: "100%",
                                fontSize:"14px",
                                textAlign: "center",
                                padding:"10px 10px "         
                            }}>Water Planet </h2>
                        </div>
                        <Menu
                            mode="vertical"
                            style={{
                                height: 620,
                            }}
                            items={menuItems}

                        />
                    </Sider>
                    <Layout>
                        <Header
                            style={{
                                backgroundColor: "#13c6fb",
                            }}>

                            <div
                                style={{
                                    display: "flex",
                                    color: "white",
                                }}
                            >
                                <h2> Site Yönetim Paneli</h2>
                            </div>
                        </Header>
                        <Content>
                            <div
                                className="site-layout-background"
                                style={{
                                    padding: "24px 50px",
                                    minHeight: 360,
                                }}
                            >
                                {children}
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        );
    } else {
        return (window.location.href = "/");
    }
};

AdminLayout.propTypes = {
    children: PropTypes.node,
};

export default AdminLayout;
