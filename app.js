const normalize = (value) => String(value ?? "").replace(/\s+/g, "").toUpperCase();

const parseCSVLine = (line) => {
  const cells = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(cell);
      cell = "";
      continue;
    }

    cell += char;
  }

  cells.push(cell);
  return cells;
};

const parseCSV = (text) => {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  const headers = parseCSVLine(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    return headers.reduce((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {});
  });
};

const data = await fetch("./predicted.csv").then((response) => response.text());
const records = parseCSV(data).map((record) => ({
  serumHA: normalize(record.seq_a),
  serumNA: normalize(record.seq_b),
  virusHA: normalize(record.seq_c),
  virusNA: normalize(record.seq_d),
  serumPassage: normalize(record.serumPassCat),
  virusPassage: normalize(record.virusPassCat),
  prediction: record.prediction,
}));

const form = document.querySelector("#query-form");
const output = document.querySelector("#prediction");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const serumHA = normalize(document.querySelector("#serumHA").value);
  const serumNA = normalize(document.querySelector("#serumNA").value);
  const virusHA = normalize(document.querySelector("#virusHA").value);
  const virusNA = normalize(document.querySelector("#virusNA").value);
  const serumPassage = normalize(document.querySelector("#serumPassage").value);
  const virusPassage = normalize(document.querySelector("#virusPassage").value);

  const match = records.find((record) =>
    record.serumHA === serumHA &&
    record.serumNA === serumNA &&
    record.virusHA === virusHA &&
    record.virusNA === virusNA &&
    record.serumPassage === serumPassage &&
    record.virusPassage === virusPassage
  );

  output.textContent = match ? match.prediction : "无结果";
});
