const DSAProcessor = require('./dsa');
const LanguageProcessor = require('./language');
const PhotographyProcessor = require('./photography');

const processorMap = new Map([
  ['dsa', DSAProcessor],
  ['language', LanguageProcessor],
  ['photography', PhotographyProcessor],
]);

function get(category) {
  const ProcessorClass = processorMap.get(category) || DSAProcessor;
  return new ProcessorClass();
}

module.exports = { get };
