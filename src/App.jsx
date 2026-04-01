import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "sonner";
import { CartProvider }           from "@/context/CartContext";
import { WishlistProvider }       from "@/context/WishlistContext";
import { AuthProvider }           from "@/context/AuthContext";
import { SellerProductsProvider } from "@/context/SellerProductsContext";
import { setTokenGetter }         from "@/lib/api";
import CartDrawer        from "@/components/CartDrawer";
import Index             from "./pages/Index";
import ProductDetail     from "./pages/ProductDetail";
import Shop              from "./pages/Shop";
import Wishlist          from "./pages/Wishlist";
import Login             from "./pages/Login";
import Signup            from "./pages/Signup";
import Account           from "./pages/Account";
import SellerDashboard   from "./pages/SellerDashboard";
import Checkout          from "./pages/Checkout";
import ForgotPassword    from "./pages/ForgotPassword";
import NotFound          from "./pages/NotFound";
import SelectRole        from "./pages/SelectRole";


const queryClient = new QueryClient();

// Inject Clerk's getToken into our API helper so every fetch gets the JWT
const TokenInjector = () => {
  const { getToken } = useClerkAuth();
  useEffect(() => {
    setTokenGetter(() => getToken());
  }, [getToken]);
  return null;
};

const AppRoutes = () => (
  <AuthProvider>
    <SellerProductsProvider>
      <CartProvider>
        <WishlistProvider>
          <TokenInjector />
          <Toaster />
          <SonnerToaster richColors position="bottom-right" />
          <CartDrawer />
          <Routes>
            {/* <Route path="/account" element={<Account />} /> */}
            <Route path="/"                element={<Index />} />
            <Route path="/product/:id"     element={<ProductDetail />} />
            <Route path="/shop"            element={<Shop />} />
            <Route path="/wishlist"        element={<Wishlist />} />
            <Route path="/login/*"         element={<Login />} />
            <Route path="/signup/*"        element={<Signup />} />
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/account"         element={<Account />} />
            <Route path="/sellerdashboard"          element={<SellerDashboard />} />
            <Route path="/checkout"        element={<Checkout />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="*"                element={<NotFound />} />
          </Routes>
        </WishlistProvider>
      </CartProvider>
    </SellerProductsProvider>
  </AuthProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
