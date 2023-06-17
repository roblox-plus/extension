const fs = require('fs/promises');
const markdownJsonFile = './src/markdown.json';

const updateMarkdown = async (markdownJson) => {
  markdownJson['privacyPolicy'] = await fs.readFile(
    '../../PRIVACY.md',
    'utf-8'
  );

  await fs.writeFile(
    markdownJsonFile,
    JSON.stringify(markdownJson, null, '  ')
  );
};

fs.readFile(markdownJsonFile)
  .then(async (data) => {
    await updateMarkdown(JSON.parse(data.toString()));
  })
  .catch(async () => {
    await updateMarkdown({});
  });
