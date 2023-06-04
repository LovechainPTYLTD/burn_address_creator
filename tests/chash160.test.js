const { getChash } = require('../utils');

describe('getChash', () => {
   test('should return correct c-hash for given data and chash_length', () => {
      const data = 'Hello World';
      const chash_length = 160;

      // TODO: Add expected c-hash value for 'Hello World' and chash_length 160
      const expectedChash = '3YCO5VU2E5ORSR7KP3ZSKG2UJZVBHCHQ';

      const result = getChash(data, chash_length);

      expect(result).toEqual(expectedChash);
   });

   test('should throw an error for invalid chash_length', () => {
      const data = 'Hello World';
      const chash_length = 123; // invalid chash_length

      expect(() => {
         getChash(data, chash_length);
      }).toThrow(Error);
   });

   test('should throw an error for invalid data', () => {
      const data = 123; // invalid data
      const chash_length = 160;

      expect(() => {
         getChash(data, chash_length);
      }).toThrow(Error);
   });
});
