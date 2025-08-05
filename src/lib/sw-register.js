export function register() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `/sw.js`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
          console.log('SW registered: ', registration);
          
          // Controlla aggiornamenti
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nuovo contenuto disponibile
                console.log('New content is available; please refresh.');
              } else if (installingWorker.state === 'installed') {
                // Contenuto cached per uso offline
                console.log('Content is cached for offline use.');
              }
            });
          });
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

export function unregister() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    }).catch(error => {
      console.error(error.message);
    });
  }
}