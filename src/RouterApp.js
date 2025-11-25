// rfce ==> TAB

// REACT
import React from 'react';

// I18N
import { withTranslation } from 'react-i18next';

// ROUTER

// COMPONENTS
import HeaderComponent from './components/HeaderComponent';
import MainComponent from './components/MainComponent';
import FooterComponent from './components/FooterComponent';

// ROUTER APP COMPONENT
function RouterApp() {
  return (
    <React.Fragment>
      {/* HEADER */}
      <HeaderComponent logo="fa-solid fa-blog" />

      {/* MAIN */}
      <MainComponent />

      {/* FOOTER */}
      <FooterComponent copy="&copy; Bütün Haklar Saklıdır." />
    </React.Fragment>
  );
}

// HOC withTranslation
export default withTranslation()(RouterApp);
