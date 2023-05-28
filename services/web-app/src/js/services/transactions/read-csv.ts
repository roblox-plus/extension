import { parse } from 'csv-parse/browser/esm';

const parseCsv = (csvFile: File): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    const records: any[] = [];

    try {
      const csvText = await csvFile.text();
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
