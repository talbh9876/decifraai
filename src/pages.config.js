/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import About from './pages/About';
import Accessibility from './pages/Accessibility';
import ActivityHistory from './pages/ActivityHistory';
import Analysis from './pages/Analysis';
import CompleteUpgradePayment from './pages/CompleteUpgradePayment';
import DashboardHome from './pages/DashboardHome';
import FAQ from './pages/FAQ';
import Folders from './pages/Folders';
import Home from './pages/Home';
import LawyerDashboard from './pages/LawyerDashboard';
import Notifications from './pages/Notifications';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Upgrade from './pages/Upgrade';
import Upload from './pages/Upload';
import UserManagement from './pages/UserManagement';
import __Layout from './Layout.jsx';


export const PAGES = {
    "About": About,
    "Accessibility": Accessibility,
    "ActivityHistory": ActivityHistory,
    "Analysis": Analysis,
    "CompleteUpgradePayment": CompleteUpgradePayment,
    "DashboardHome": DashboardHome,
    "FAQ": FAQ,
    "Folders": Folders,
    "Home": Home,
    "LawyerDashboard": LawyerDashboard,
    "Notifications": Notifications,
    "Privacy": Privacy,
    "Profile": Profile,
    "Settings": Settings,
    "Support": Support,
    "Terms": Terms,
    "Upgrade": Upgrade,
    "Upload": Upload,
    "UserManagement": UserManagement,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};