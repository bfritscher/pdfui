function angleToDirection(angle) {
  if (angle % 90 !== 0) {
    return "";
  }
  if (Math.abs(angle) === 180) {
    return "down";
  }
  // eslint-disable-next-line
  angle = angle % 360;
  if (angle === 0) {
    return "";
  }
  if (angle === 90 || angle === -270) {
    return "right";
  }
  return "left";
}

function pagesToCommands(mapping, pages) {
  const mappingString = Object.keys(mapping)
    .map((key) => `${key}=${mapping[key]}`)
    .join(" ");
  let endString;
  return pages
    .filter((page) => !page.remove)
    .reduce((commands, page, i, activePages) => {
      if (page.cutBefore || commands.length === 0) {
        if (page.cutBefore && commands.length > 0) {
          // eslint-disable-next-line
          commands[commands.length - 1] += endString;
        }
        commands.push(`pdftk ${mappingString} cat `);
        endString = `output ${page.data.name}.pdf`;
      }
      // eslint-disable-next-line
      commands[commands.length - 1] += page.src + page.page + angleToDirection(page.angle) + " ";
      if (i + 1 === activePages.length) {
        // eslint-disable-next-line
        commands[commands.length - 1] += endString;
      }
      return commands;
    }, []);
}

export { angleToDirection, pagesToCommands };
