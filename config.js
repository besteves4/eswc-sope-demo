/* eslint import/extensions: 0 */
import packageJson from "./package.json";

export default () => ({
  libraryRepoUrl: packageJson.repository.url,
  demoRepoUrl: packageJson.repository.url,
  copyright: "Copyright 2021 Inrupt, Inc.",
  demoTitle: "ESWC demo",
  demoDescription: "ESWC Demonstrator used to simulate an app request for personal data and the respective response",
});
