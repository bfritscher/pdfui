import rangeToNumberArray from '@/utils';

describe('rangeToNumberArray', () => {
  it('Should parse a single number', () => {
    expect(rangeToNumberArray('3')).to.eql([3]);
  });
  it('Should parse a fixed range', () => {
    expect(rangeToNumberArray('3-5')).to.eql([3, 4, 5]);
  });
  it('Should parse a n range', () => {
    expect(rangeToNumberArray('2-n', 4)).to.eql([2, 3, 4]);
  });
  it('Should parse multiple single number', () => {
    expect(rangeToNumberArray('3,6,8')).to.eql([3, 6, 8]);
  });
  it('Should sort order', () => {
    expect(rangeToNumberArray('8,6,3')).to.eql([3, 6, 8]);
  });
  it('Should parse mixed single number and ranges', () => {
    expect(rangeToNumberArray('3, 5-7')).to.eql([3, 5, 6, 7]);
  });
  it('Should work with wrong ranges', () => {
    expect(rangeToNumberArray('3, 5-4')).to.eql([3, 4, 5]);
  });
  it('Should ignore index overflow', () => {
    expect(rangeToNumberArray('3, 5, n', 4)).to.eql([3, 4]);
  });
  it('Should ignore duplicates', () => {
    expect(rangeToNumberArray('3,3 - 4,3')).to.eql([3, 4]);
  });
});
