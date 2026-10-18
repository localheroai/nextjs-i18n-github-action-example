// Fails when a target locale is missing a key, has an empty value, drops or
// adds an ICU argument, or lacks a plural category its language needs
// (Polish needs one, few, many and other where English needs one and other).

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {parse, TYPE} from '@formatjs/icu-messageformat-parser';

const config = JSON.parse(readFileSync('localhero.json', 'utf8'));
const messagesDir = config.translationFiles.paths[0];

function loadMessages(locale) {
  return JSON.parse(readFileSync(join(messagesDir, `${locale}.json`), 'utf8'));
}

function flatten(messages, prefix = '') {
  return Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' ? flatten(value, path) : [[path, value]];
  });
}

function walk(elements, visit) {
  for (const element of elements) {
    visit(element);
    if (element.type === TYPE.plural || element.type === TYPE.select) {
      for (const option of Object.values(element.options)) walk(option.value, visit);
    }
    if (element.type === TYPE.tag) walk(element.children, visit);
  }
}

const ARGUMENT_KINDS = {
  [TYPE.number]: 'number',
  [TYPE.date]: 'date',
  [TYPE.time]: 'time',
  [TYPE.select]: 'select'
};

function argumentKind(element) {
  if (element.type === TYPE.plural) return element.pluralType === 'ordinal' ? 'selectordinal' : 'plural';
  return ARGUMENT_KINDS[element.type];
}

// `{count, plural, ...}` and a plain `{count}` are different arguments, so a
// translation that flattens a plural shows up as one dropped and one added.
function argumentNames(ast) {
  const names = new Set();
  walk(ast, (element) => {
    if (element.type === TYPE.tag) names.add(`<${element.value}>`);
    else if (element.type === TYPE.argument) names.add(`{${element.value}}`);
    else if (argumentKind(element)) names.add(`{${element.value}, ${argumentKind(element)}}`);
  });
  return names;
}

function missingPluralCategories(ast, locale) {
  const problems = [];
  walk(ast, (element) => {
    if (element.type !== TYPE.plural) return;
    const rules = new Intl.PluralRules(locale, {type: element.pluralType});
    const missing = rules.resolvedOptions().pluralCategories.filter((category) => !(category in element.options));
    if (missing.length) problems.push(`{${element.value}} is missing plural forms: ${missing.join(', ')}`);
  });
  return problems;
}

function difference(a, b) {
  return [...a].filter((item) => !b.has(item));
}

const source = new Map(flatten(loadMessages(config.sourceLocale)));
const sourceArguments = new Map([...source].map(([key, value]) => [key, argumentNames(parse(value))]));
let problemCount = 0;

for (const locale of config.outputLocales) {
  const target = new Map(flatten(loadMessages(locale)));
  const report = (key, problem) => {
    problemCount++;
    console.log(`${locale}  ${key}  ${problem}`);
  };

  for (const [key, expected] of sourceArguments) {
    const value = target.get(key);
    if (value === undefined) {
      report(key, 'missing');
      continue;
    }
    if (value.trim() === '') {
      report(key, 'empty');
      continue;
    }

    let ast;
    try {
      ast = parse(value);
    } catch (error) {
      report(key, `invalid ICU message: ${error.message}`);
      continue;
    }

    const actual = argumentNames(ast);
    const dropped = difference(expected, actual);
    const added = difference(actual, expected);
    if (dropped.length) report(key, `drops ${dropped.join(', ')}`);
    if (added.length) report(key, `adds ${added.join(', ')} not in ${config.sourceLocale}`);
    for (const problem of missingPluralCategories(ast, locale)) report(key, problem);
  }

  for (const key of target.keys()) {
    if (!source.has(key)) console.log(`${locale}  ${key}  not in ${config.sourceLocale} (warning only)`);
  }
}

if (problemCount > 0) {
  console.log(`\n${problemCount} translation problem(s) found.`);
  process.exit(1);
}

console.log(`All ${source.size} keys are translated in ${config.outputLocales.join(', ')}.`);
