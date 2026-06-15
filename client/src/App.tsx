// Trigger Vercel redeploy
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Tours from "./pages/Tours";
import Experiences from "./pages/Experiences";
import Plan from "./pages/Plan";
import Compare from "./pages/Compare";
import MyBookings from "./pages/MyBookings";
import Host from "./pages/Host";
import PaymentResult from "./pages/PaymentResult";
import Blog from "./pages/Blog";
import Faq from "./pages/Faq";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Community from "./pages/Community";
import Thread from "./pages/Thread";
import Stories from "./pages/Stories";
import StoryNew from "./pages/StoryNew";
import StoryDetail from "./pages/StoryDetail";
import Feed from "./pages/Feed";
import VisualSearch from "./pages/VisualSearch";
import ProfileRedirect from "./pages/ProfileRedirect";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/tours"} component={Tours} />
      <Route path={"/experiences"} component={Experiences} />
      <Route path={"/plan"} component={Plan} />
      <Route path={"/compare"} component={Compare} />
      <Route path={"/my-bookings"} component={MyBookings} />
      <Route path={"/host"} component={Host} />
      <Route path={"/payment/success"}>{() => <PaymentResult outcome="success" />}</Route>
      <Route path={"/payment/cancel"}>{() => <PaymentResult outcome="cancel" />}</Route>
      <Route path={"/about"} component={About} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/faq"} component={Faq} />
      <Route path={"/privacy"} component={Privacy} />
      <Route path={"/terms"} component={Terms} />
      <Route path={"/community"} component={Community} />
      <Route path={"/community/thread/:id"} component={Thread} />
      <Route path={"/stories"} component={Stories} />
      <Route path={"/stories/new"} component={StoryNew} />
      <Route path={"/stories/:id"} component={StoryDetail} />
      <Route path={"/feed"} component={Feed} />
      <Route path={"/visual-search"} component={VisualSearch} />
      <Route path={"/profile"} component={ProfileRedirect} />
      <Route path={"/profile/edit"} component={ProfileEdit} />
      <Route path={"/u/:username"} component={Profile} />
      <Route path={"/auth"} component={Home} />
      <Route path={"/login"} component={Home} />
      <Route path={"/signup"} component={Home} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
