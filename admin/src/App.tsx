import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './hooks/useAdminAuth';
import { Layout } from './components/layout/Layout';
import { LoginScreen } from './screens/LoginScreen/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen/DashboardScreen';
import { PacksScreen } from './screens/PacksScreen/PacksScreen';
import { PackEditorScreen } from './screens/PackEditorScreen/PackEditorScreen';
import { ModelsScreen } from './screens/ModelsScreen/ModelsScreen';
import { ModelEditorScreen } from './screens/ModelEditorScreen/ModelEditorScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ROUTES } from './constants/routes';

export const App: React.FC = () => {
  const { user, loading, error, signIn, signOutUser } = useAdminAuth();

  if (loading) return <LoadingSpinner fullPage />;

  if (!user) {
    return (
      <BrowserRouter>
        <LoginScreen onSignIn={signIn} loading={loading} error={error} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout user={user} onSignOut={signOutUser}>
        <Routes>
          <Route path={ROUTES.DASHBOARD}     element={<DashboardScreen />} />
          <Route path={ROUTES.PACKS}         element={<PacksScreen />} />
          <Route path={ROUTES.PACK_NEW}      element={<PackEditorScreen />} />
          <Route path={ROUTES.PACK_EDIT}     element={<PackEditorScreen />} />
          <Route path={ROUTES.MODELS}        element={<ModelsScreen />} />
          <Route path={ROUTES.MODEL_NEW}     element={<ModelEditorScreen />} />
          <Route path={ROUTES.MODEL_EDIT}    element={<ModelEditorScreen />} />
          <Route path={ROUTES.USERS}         element={<PlaceholderScreen title="Users" />} />
          <Route path={ROUTES.USER_DETAIL}   element={<PlaceholderScreen title="User Detail" />} />
          <Route path={ROUTES.ANALYTICS}     element={<PlaceholderScreen title="Analytics" />} />
          <Route path={ROUTES.MODERATION}    element={<PlaceholderScreen title="Moderation" />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<PlaceholderScreen title="Notifications" />} />
          <Route path={ROUTES.APP_CONFIG}    element={<PlaceholderScreen title="App Config" />} />
          <Route path={ROUTES.REVENUE}       element={<PlaceholderScreen title="Revenue" />} />
          <Route path={ROUTES.FEEDBACK}      element={<PlaceholderScreen title="Feedback" />} />
          <Route path="*"                    element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
