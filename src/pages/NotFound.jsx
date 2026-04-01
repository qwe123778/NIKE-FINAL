import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const NotFound = () => (
  <>
    <Navbar />
    <div className="flex min-h-screen items-center justify-center px-6 pt-16">
      <div className="text-center">
        <p className="font-mono-tech text-primary mb-4">Error 404</p>
        <h1 className="hero-text mb-6">Lost<br/>the Track</h1>
        <p className="text-muted-foreground mb-10 max-w-xs mx-auto font-mono-tech">This page doesn't exist. Head back and keep moving.</p>
        <Link to="/" className="action-button inline-flex min-w-[200px]"><span>Back to Shop</span><span className="font-mono text-sm">→</span></Link>
      </div>
    </div>
  </>
);

export default NotFound;
