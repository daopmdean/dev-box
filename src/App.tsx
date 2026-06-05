import { createElement } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Layout from "./components/Layout";
import { tools } from "./tools/registry";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to={tools[0].path} replace /> },
      ...tools.map((tool) => ({
        path: tool.path.replace(/^\//, ""),
        element: createElement(tool.component),
      })),
      { path: "*", element: <Navigate to={tools[0].path} replace /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
