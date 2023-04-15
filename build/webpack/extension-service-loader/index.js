// This loader exists to ensure that all services in the services directory get put into the global scope.
// This for ease of testing.
const path = require('path');
const fs = require('fs');

const declareGlobal = (source, serviceName) => {
  const exportMatch = source.match(/export\s*(\{[^\}]+\})/);
  if (!exportMatch) {
    console.warn('Could not determine exported service items.');
    return source;
  }

  const injectIndex = source.indexOf(exportMatch[0]);
  const globalServiceTemplate = `
// Export + attach to global
declare global {
  var ${serviceName}: any;
}

globalThis.${serviceName} = ${exportMatch[1]};
`;

  return (
    source.substring(0, injectIndex) + globalServiceTemplate + exportMatch[0]
  );
};

module.exports = function (source) {
  if (
    path.basename(path.dirname(path.dirname(this.resourcePath))) ===
      'services' &&
    path.basename(this.resourcePath, '.ts') === 'index'
  ) {
    const serviceName =
      path.basename(path.dirname(this.resourcePath)) + 'Service';
    return declareGlobal(source, serviceName);
  }

  if (path.basename(path.dirname(this.resourcePath)) === 'service-worker') {
    // This to make sure all services are included in the service worker, so they can listen for messages.
    // And just.. be available.
    const services = fs.readdirSync('./src/js/services');
    const serviceExports = services.map(
      (serviceName) =>
        `export * as ${path.basename(
          serviceName,
          '.ts'
        )} from '../services/${serviceName}'`
    );

    return serviceExports.join('\n') + '\n' + source;
  }

  return source;
};
