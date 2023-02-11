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
  const serviceName = path.basename(this.resourcePath, '.ts');
  if (serviceName.endsWith('Service')) {
    return declareGlobal(source, serviceName);
  }

  if (serviceName === 'service-worker') {
    // This to make sure all services are included in the service worker, so they can listen for messages.
    // And just.. be available.
    const services = fs.readdirSync('./src/js/services');
    const serviceExports = services.map(
      (serviceFileName) =>
        `export * as ${path.basename(
          serviceFileName,
          '.ts'
        )} from './services/${path.basename(serviceFileName, '.ts')}'`
    );

    return serviceExports.join('\n') + '\n' + source;
  }

  return source;
};
