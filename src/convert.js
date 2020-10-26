const MAX_SECTION_LENGTH = 15 * 1000;

function time(str) {
  const [hms, ms] = str.split(",");
  const [hours, mins, secs] = hms.split(":").map((x) => parseInt(x, 10));
  return 1000 * (60 * (60 * hours + mins) + secs) + parseInt(ms, 10);
}

function parseTimeRange(rangeStr) {
  return rangeStr.split("-->").map((x) => time(x.trim()));
}

function getSections(originalString) {
  const lines = originalString.split("\n");
  const sections = [];
  let currentSection = { text: "" };
  lines.forEach((line, lineIdx) => {
    switch (lineIdx % 4) {
      case 1:
        const [lineStart, lineEnd] = parseTimeRange(line);
        currentSection.end = lineEnd;
        // if it's a new section, need to set the start
        if (!("start" in currentSection)) {
          currentSection.start = lineStart;
        }
        // always need to update the end
        currentSection.end = lineEnd;
        break;
      case 2:
        currentSection.text += ` ${line.trim()}`;
        break;
      default:
        // nothing
        break;
    }
    const sectionIsFull =
      currentSection.end - currentSection.start >= MAX_SECTION_LENGTH;
    if (sectionIsFull || lineIdx === lines.length - 1) {
      sections.push(currentSection);
      currentSection = { text: "" };
    }
  });
  return sections.map((section) => ({ ...section, text: section.text.trim() }));
}

function leftPad(num) {
  const numStr = `${num}`;
  return numStr.length < 2 ? `0${numStr}` : numStr;
}

function timeStamp(ms) {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  let rem = ms - hours * (60 * 60 * 1000);
  const mins = Math.floor(rem / (60 * 1000));
  rem = rem - mins * (60 * 1000);
  const secs = Math.floor(rem / 1000);
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
