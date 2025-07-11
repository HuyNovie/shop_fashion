import { createBrowserRouter } from "react-router-dom"; 
import App from "./App";
import ShopApplication from "./pages/ShopApplication";
import ProductListPage from "./pages/ProductListPage/ProductListPage";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import { loaderProductBySlug } from "./routes/product";
import AutheticationWrapper from "./pages/AutheticationWrapper";
import Register from "./pages/Register/Register";
import Login from "./pages/Login/Login";
import OAuth2loginCallback from "./pages/OAuth2loginCallback";
import Cart from "./pages/Cart/Cart";
import Account from "./pages/Account/Account";
import ProtectedRoute from "./components/ProtectdRouter/ProtectedRouter.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import Payment from "./pages/Payment/Payment.jsx";
import ConfirmPayment from "./pages/ConfirmPayment/ConfirmPayment.jsx";
import OrderConfirmed from "./pages/OrderComfirmed/OrderComfirmed.jsx";

export const router = createBrowserRouter([
    { 
        path: "/",
        element: <ShopApplication />,
        children: [
            {
                path: "",
                element: <App/>,
            },
            {
                path: "products",
                element: <ProductListPage categoryType={'WOMEN'} />,
            },
            {
                path: "products1",
                element: <ProductListPage categoryType={'MEN'} />,
            },
            {
                path: "product/:productSlug",
                loader: loaderProductBySlug,
                element: <ProductDetails />,
            },
            {
                path: "cart-items",
                element: <Cart/>
            },
            {
                path: "account-details",
                element: <ProtectedRoute><Account/></ProtectedRoute>
            }
            ,
            {
                path: "checkout",
                element: <ProtectedRoute><Checkout/></ProtectedRoute>
            },
            {
            path:'/orderConfirmed',
            element: <OrderConfirmed />
            }


        ]
    },
    {
        path: "/v1/",
        element: <AutheticationWrapper />,
        children: [
            {
                path: "login",
                element:<Login />
            },
            {
                path: "register",
                element:<Register />
            }
        ]
    },
    {
        path: '/oauth2/callback',
        element : <OAuth2loginCallback />
    },
    {
      path:'/confirmPayment',
      element:<ConfirmPayment />
    },
    // {
    //   path:'/admin/*',
    //   element:<ProtectedRoute><AdminPanel /></ProtectedRoute>
    // }         
]);