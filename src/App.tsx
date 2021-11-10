import { Refine, AuthProvider } from "@pankod/refine";
import routerProvider from "@pankod/refine-react-router";

import "@pankod/refine/dist/styles.min.css";
import simpleRestDataProvider from "@pankod/refine-simple-rest";
import axios from "axios";
import { useGoogleLogout, GoogleLoginResponse } from "react-google-login";

import { Login } from "pages/login";
import { PostList, PostCreate, PostEdit, PostShow } from "pages/posts";
import {
  Title,
  Header,
  Sider,
  Footer,
  Layout,
  OffLayoutArea,
} from "components/layout";
import { useTranslation } from "react-i18next";

function App() {
  const { signOut } = useGoogleLogout({
    clientId: "your-client-id",
    cookiePolicy: "single_host_origin",
  });
  const { t, i18n } = useTranslation();

  const API_URL = "https://api.fake-rest.refine.dev";
  const dataProvider = simpleRestDataProvider(API_URL);

  const authProvider: AuthProvider = {
    login: ({ tokenId, profileObj, tokenObj }: GoogleLoginResponse) => {
      axios.defaults.headers.common = {
        Authorization: `Bearer ${tokenId}`,
      };

      localStorage.setItem(
        "user",
        JSON.stringify({ ...profileObj, avatar: profileObj.imageUrl })
      );
      localStorage.setItem("expiresAt", tokenObj.expires_at.toString());

      return Promise.resolve();
    },
    logout: () => {
      signOut();
      localStorage.removeItem("user");
      localStorage.removeItem("expiresAt");
      return Promise.resolve();
    },
    checkError: () => Promise.resolve(),
    checkAuth: async () => {
      const expiresAt = localStorage.getItem("expiresAt");

      if (expiresAt) {
        return new Date().getTime() / 1000 < +expiresAt
          ? Promise.resolve()
          : Promise.reject();
      }
      return Promise.reject();
    },

    getPermissions: () => Promise.resolve(),
    getUserIdentity: async () => {
      const user = localStorage.getItem("user");
      if (user) {
        return Promise.resolve(JSON.parse(user));
      }
    },
  };

  const i18nProvider = {
    translate: (key: string, params: object) => t(key, params),
    changeLocale: (lang: string) => i18n.changeLanguage(lang),
    getLocale: () => i18n.language,
  };

  return (
    <Refine
      routerProvider={routerProvider}
      dataProvider={dataProvider}
      authProvider={authProvider}
      LoginPage={Login}
      resources={[
        {
          name: "posts",
          list: PostList,
          create: PostCreate,
          edit: PostEdit,
          show: PostShow,
        },
      ]}
      Title={Title}
      Header={Header}
      Sider={Sider}
      Footer={Footer}
      Layout={Layout}
      OffLayoutArea={OffLayoutArea}
      i18nProvider={i18nProvider}
    ></Refine>
  );
}

export default App;
