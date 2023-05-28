import { parse } from 'csv-parse/browser/esm';
import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';

const readFileContents = async (file: File): Promise<string> => {
  if (file.type === 'text/csv') {
    return await file.text();
  } else {
    const zipFileReader = new BlobReader(file);
    const zipReader = new ZipReader(zipFileReader);
    const zippedFiles = await zipReader.getEntries();

    const csvFile = zippedFiles.shift();
    if (!csvFile?.getData) {
      throw 'Could not detect CSV file in zip';
    }

    const textWriter = new TextWriter();
    const csvText = await csvFile.getData(textWriter);
    zipReader.close();

    return csvText;
  }
};

const parseCsv = (csvFile: File): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const records: any[] = [];

    try {
      const csvText = await readFileContents(csvFile);
      const parser = parse({
        columns: true,
      });

      parser.on('readable', () => {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });
      parser.on('error', reject);
      parser.on('end', () => resolve(records));

      parser.write(csvText);

      parser.end();
    } catch (err) {
      reject(err);
    }
  });
};

export { parseCsv };
