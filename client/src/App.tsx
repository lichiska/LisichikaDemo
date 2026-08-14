// Signal Noir design reminder: establish the shared shell first so every route has a clear escape path.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PreferencesProvider } from "./contexts/PreferencesContext";
import About from "./pages/About";
import AITools from "./pages/AITools";
import Studio from "./pages/Studio";
import Archive from "./pages/Archive";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import TransmissionDetail from "./pages/TransmissionDetail";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/transmissions" component={Archive} /><Route path="/transmissions/:id" component={TransmissionDetail} /><Route path="/studio" component={Studio} /><Route path="/tools" component={Studio} /><Route path="/about" component={About} /><Route path="/contact" component={Contact} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }
export default function App() { return <ErrorBoundary><PreferencesProvider><ThemeProvider defaultTheme="dark"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></PreferencesProvider></ErrorBoundary>; }
