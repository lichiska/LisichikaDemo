// Signal Noir design reminder: establish the shared shell first so every route has a clear escape path.
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";

const Account = lazy(() => import("./pages/Account"));
const About = lazy(() => import("./pages/About"));
const AITools = lazy(() => import("./pages/AITools"));
const Studio = lazy(() => import("./pages/Studio"));
const Archive = lazy(() => import("./pages/Archive"));
const Contact = lazy(() => import("./pages/Contact"));
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TransmissionDetail = lazy(() => import("./pages/TransmissionDetail"));
function Router() { return <Switch><Route path="/" component={Home} /><Route path="/transmissions" component={Archive} /><Route path="/transmissions/:id" component={TransmissionDetail} /><Route path="/studio" component={Studio} /><Route path="/tools" component={Studio} /><Route path="/account" component={Account} /><Route path="/about" component={About} />
<Route path="/contact" component={Contact} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><PreferencesProvider><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Suspense fallback={<div className="route-loading" role="status">Loading signal…</div>}><Router /></Suspense></TooltipProvider></ThemeProvider></PreferencesProvider></ErrorBoundary>; }
