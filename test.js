async function printSecretMessage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
  const html = await response.text();

  const coordinates = new Map();
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;

  let headerIndices = null;
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    const rowHtml = match[1];
    const cells = [];
    let cellMatch;

    while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
      cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
    }

    if (!cells.length) continue;

    if (!headerIndices) {
      const lower = cells.map((c) => c.toLowerCase());
      const xIndex = lower.indexOf("x-coordinate");
      const charIndex = lower.indexOf("character");
      const yIndex = lower.indexOf("y-coordinate");

      if (xIndex !== -1 && charIndex !== -1 && yIndex !== -1) {
        headerIndices = { xIndex, charIndex, yIndex };
      }
      continue;
    }

    const { xIndex, charIndex, yIndex } = headerIndices;
    const x = Number(cells[xIndex]);
    const char = cells[charIndex];
    const y = Number(cells[yIndex]);

    if (Number.isInteger(x) && Number.isInteger(y) && char) {
      coordinates.set(`${x},${y}`, char);
    }
  }

  if (coordinates.size === 0) {
    throw new Error("No coordinate data found.");
  }

  const points = [...coordinates.keys()].map((k) => k.split(",").map(Number));
  const maxX = Math.max(...points.map(([x]) => x));
  const maxY = Math.max(...points.map(([, y]) => y));

  for (let y = maxY; y >= 0; y--) {
    let line = "";
    for (let x = 0; x <= maxX; x++) {
      line += coordinates.get(`${x},${y}`) ?? " ";
    }
    console.log(line.trimEnd());
  }
}

printSecretMessage(
  "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub"
).catch(console.error);
