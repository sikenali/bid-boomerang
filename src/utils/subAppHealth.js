const HEALTH_TIMEOUT = 3000;

export function isSubAppAvailable(url) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT);

    fetch(url, { method: 'HEAD', signal: controller.signal, mode: 'no-cors' })
      .then(() => {
        clearTimeout(timer);
        resolve(true);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(false);
      });
  });
}

export function checkAllSubApps(apps) {
  return Promise.all(apps.map(async (app) => ({
    name: app.name,
    url: app.url,
    available: await isSubAppAvailable(app.url),
  })));
}
