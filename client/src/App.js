import logo from './logo.svg';
import './App.css';
import RootLayout from './RootLayout';
import Error from './components/js/Error';
import SignIn from './components/js/SignIn';
import {RouterProvider,Navigate,createBrowserRouter} from 'react-router-dom';
import SignUp from './components/js/SignUp';
import UserProvider from './components/js/context';
import HomeBody from './components/js/Home';
import CreateThought from './components/js/CreateThought';
import UserProfile from './components/js/UserProfile';
import EditThought from './components/js/EditThought';
function App() {
  let router = createBrowserRouter([
    {
      path: '',
      element: <RootLayout/>,
      errorElement: <Error />,
      children: [
        {
          path: '/home',
          element: <HomeBody/>
        },
        {
          path: '',
          element: <HomeBody/>
        },
        {
          path: '/',
          element: <HomeBody/>
        },
        {
          path: '/signin',
          element: <SignIn/>
        },
        {
          path: '/signup',
          element : <SignUp/>
        },
        {
          path: '/create-thought',
          element: <CreateThought/>
        },
        {
          path: '/user-profile',
          element: <UserProfile/>
        },
        {
          path: '/edit-thought',
          element: <EditThought/>
        }
      ]
    }
  ])
  return (
    <div className="App">
      <UserProvider>
          <RouterProvider router={router} />
      </UserProvider>  
    </div>
  );
}

export default App;
