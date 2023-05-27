import { spawn } from 'child_process';

const keyFile = './secrets/localhost.key';
const certFile = './secrets/localhost.crt';

const runProcess = (executable, args) => {
  return new Promise((resolve, reject) => {
    const process = spawn(executable, args, {
      shell: 'powershell.exe',
    });

    process.stdout.on('data', (data) => {
      const log = data.toString();
      if (log.length > 1) {
        console.log(log);
      }
    });

    process.stderr.on('data', (data) => {
      console.error(data.toString());
    });

    process.on('close', async (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
};

// https://stackoverflow.com/a/10176685/1663648
runProcess('openssl', [
  'req',
  '-nodes',
  '-x509',
  '-newkey',
  'rsa:4096',
  '-keyout',
  keyFile,
  '-out',
  certFile,
  '-sha256',
  '-days',
  '365',
  '-subj',
  '/CN=localhost',
  '-addext',
  'subjectAltName=DNS:localhost',
])
  .then(() => {
    // Certificate generated.
    // Now we need to trust it.
    runProcess('Import-Certificate', [
      '-FilePath',
      certFile,
      '-CertStoreLocation',
      'cert:\\LocalMachine\\Root',
    ]);
  })
  .catch((errorCode) => console.error('openssl failed:', errorCode));
