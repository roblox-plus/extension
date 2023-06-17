const fs = require('fs/promises');
const markdownJsonFile = './src/markdown.json';

const markdownFiles = {
  privacyPolicy: '../../PRIVACY.md',
  support: '../../SUPPORT.md',
  termsOfService: '../../TERMS_OF_SERVICE.md',
};

const updateMarkdown = async (markdownJson) => {
  for (let key in markdownFiles) {
    markdownJson[key] = await fs.readFile(markdownFiles[key], 'utf-8');
  }

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
