import pkg from "../package.json";

const manifest = {
  permissions: ["*://*/*"],
};

export function getManifest(): chrome.runtime.ManifestV2 {
  return {
    author: pkg.author,
    name: pkg.displayName ?? pkg.name,
    version: pkg.version,
    manifest_version: 2,
    ...manifest,
  };
}
