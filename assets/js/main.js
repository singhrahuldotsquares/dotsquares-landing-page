/* Entry point: initialise each module (each one no-ops if its markup is absent). */
(function (DS) {
  "use strict";

  DS.initNav();
  DS.initReveal();
  DS.initFlag();
  DS.initPlatform();
  DS.initTilt();
  DS.initServices();
  DS.initCarousels();
  DS.initMarquees();
  DS.initDiagrams();
  DS.initJourney();
  DS.initMigration();
  DS.initAwards();
  DS.initBuilt();
  DS.initVideos();
  DS.initReviews();
  DS.initFaq();
  DS.initForms();
})(window.DS);
