export default function rangeToNumberArray(range, lastPage) {
  let list = range.replace(/ /g, '').replace(/n/g, lastPage).split(',');
  list = list.map(x => x.split('-'));
  const candidateNumbers = list.reduce((pages, r) => {
    if (r.length > 1) {
      const a = parseInt(Math.min(r[0], r[1]), 10);
      const b = parseInt(Math.max(r[0], r[1]), 10);
      const sublist = [];
      sublist.length = (b - a) + 1;
      return pages.concat(sublist.fill('').map((e, i) => a + i));
    }
    pages.push(parseInt(r[0], 10));
    return pages;
  }, []);
  const maxPage = lastPage || Math.max(...candidateNumbers);
  return [...new Set(candidateNumbers.filter(p => p > 0 && p <= maxPage))].sort();
}
