import { Navigate, Route, Routes } from "react-router-dom";
import { CatalogLayout } from "../components/CatalogLayout";
import { AdminCanvasOutlet } from "../pages/AdminCanvasOutlet";
import { CatalogAllPage } from "../pages/catalog/CatalogAllPage";
import { HomePage } from "../pages/home/HomePage";
import { CatalogNewPage } from "../pages/CatalogNewPage";
import { CatalogLayoutsPage } from "../pages/catalog/CatalogLayoutsPage";
import { CatalogStubPage } from "../pages/CatalogStubPage";
import { ComingSoonPage } from "../pages/ComingSoonPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/catalog/home" replace />} />
      <Route element={<CatalogLayout />}>
        <Route path="admin" element={<Navigate to="/admin/canvas" replace />} />
        <Route path="admin/canvas" element={<AdminCanvasOutlet />} />
        <Route
          path="admin/layout"
          element={<Navigate to="/admin/canvas?view=layout" replace />}
        />
        <Route path="catalog/home" element={<HomePage />} />
        <Route path="catalog/all" element={<CatalogAllPage />} />
        <Route path="catalog/layouts" element={<CatalogLayoutsPage />} />
        <Route path="catalog/new" element={<CatalogNewPage />} />
        <Route
          path="catalog/categories"
          element={
            <CatalogStubPage
              title="Categories"
              description="Organize catalog entries by category."
            />
          }
        />
        <Route
          path="catalog/bookmarks"
          element={
            <CatalogStubPage
              title="Bookmarks"
              description="Saved catalog items."
            />
          }
        />
        <Route
          path="catalog/prototype"
          element={
            <CatalogStubPage
              title="Prototype"
              description="Experimental components."
            />
          }
        />
        <Route
          path="catalog/build-with-ami"
          element={<ComingSoonPage title="Build with AMI" />}
        />
        <Route
          path="catalog/uni-search"
          element={<ComingSoonPage title="Uni Search" />}
        />
        <Route
          path="catalog/uni-search/history"
          element={<ComingSoonPage title="Uni Search History" />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/catalog/home" replace />} />
    </Routes>
  );
}
