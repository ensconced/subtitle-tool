const chunk = require("lodash/chunk");

const MAX_SECTION_LENGTH = 15 * 1000;
const MS_PER_SEC = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SEC;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

function time(str) {
  const [hms, ms] = str.split(",");
  const [hours, mins, secs] = hms.split(":").map((x) => parseInt(x, 10));
  return 1000 * (60 * (60 * hours + mins) + secs) + parseInt(ms, 10);
}

function parseTimeRange(rangeStr) {
  return rangeStr.split("-->").map((x) => time(x.trim()));
}

function sectionIsFull(section) {
  return section.end - section.start >= MAX_SECTION_LENGTH;
}

function getSections(originalString) {
  const lines = originalString.split("\n");
  const sections = chunk(lines, 4);
  return sections.reduce((result, section) => {
    const [, range, text] = section;
    if (!range) return result;
    const [lineStart, lineEnd] = parseTimeRange(range);
    if (result.length === 0 || sectionIsFull(result[result.length - 1])) {
      // add new section
      result.push({ start: lineStart, end: lineEnd, text: text.trim() });
    } else {
      // add to current section
      const currentSection = result[result.length - 1];
      currentSection.end = lineEnd;
      currentSection.text += ` ${text.trim()}`;
    }
    return result;
  }, []);
}

function leftPad(num) {
  const numStr = `${num}`;
  return numStr.length < 2 ? `0${numStr}` : numStr;
}

function timeStamp(ms) {
  const hours = Math.floor(ms / MS_PER_HOUR);
  let rem = ms - hours * MS_PER_HOUR;
  const mins = Math.floor(rem / MS_PER_MINUTE);
  rem = rem - mins * MS_PER_MINUTE;
  const secs = Math.floor(rem / MS_PER_SEC);
  return [hours, mins, secs].map(leftPad).join(":");
}

function serializeSections(sections) {
  return sections
    .map((section) => {
      return (
        `${timeStamp(section.start)} - ${timeStamp(section.end)}` +
        `\n${section.text}`
      );
    })
    .join("\n\n");
}

export default function convert(inputStr) {
  return serializeSections(getSections(inputStr));
}
