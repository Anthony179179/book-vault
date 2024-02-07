import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import Layout from './Components/Layout';
import HomePage from './Components/HomePage';
import BookList from './Components/BookList';
import AddBook from './Components/AddBook';
import AddAuthor from './Components/AddAuthor';
import NotFound from './Components/NotFound';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

let router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />
      },
      {
        path: "/books",
        element: <BookList />
      },
      {
        path: "/addbook",
        element: <AddBook />
      },
      {
        path: "/addauthor",
        element: <AddAuthor />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ],
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
