/*jslint node: true */
"use strict";
var crypto = require('crypto');
var base32 = require('thirty-two');
var getSourceString = require('./string_utils').getSourceString;
var PI = "14159265358979323846264338327950288419716939937510";
var zeroString = "00000000";

var arrRelativeOffsets = PI.split("");

/**
 * Calculates and returns an array of offsets based on a given length of a cryptographic hash (chash).
 *
 * @param {number} chash_length - The length of the cryptographic hash.
 * @throws {Error} Throws an error if the number of calculated offsets does not equal 32.
 * @returns {number[]} An array of offset values.
 *
 * @example
 * // returns array of offsets for a given chash length
 * calcOffsets(288);
 *
 * @note The function relies on the external `arrRelativeOffsets` array for calculating relative offsets and an external `checkLength` function to validate the input length.
 * It continues to compute offset values until the cumulative offset surpasses the chash_length.
 * It's assumed that the function is used within the context of checksum computations and data validation in a cryptographic application.
 */
function calcOffsets(chash_length) {
   if (typeof chash_length !== 'number' || chash_length <= 0 || !Number.isInteger(chash_length)) {
      throw Error("Invalid input: chash_length must be a positive integer.");
   }
   checkLength(chash_length);
   var arrOffsets = [];
   var offset = 0;
   var index = 0;

   for (var i = 0; offset < chash_length; i++) {
      var relative_offset = parseInt(arrRelativeOffsets[i]);
      if (relative_offset === 0)
         continue;
      offset += relative_offset;
      if (chash_length === 288)
         offset += 4;
      if (offset >= chash_length)
         break;
      arrOffsets.push(offset);
      index++;
   }

   if (index != 32)
      throw Error("wrong number of checksum bits");

   return arrOffsets;
}

var arrOffsets160 = calcOffsets(160);
var arrOffsets288 = calcOffsets(288);
/**
 * Splits a binary string into clean data and checksum parts based on pre-defined offsets. 
 *
 * @param {string} bin - The binary string to be split.
 * @throws {Error} Throws an error if the length of the binary string is not equal to 160 or 288.
 * @returns {Object} An object with two properties: 
 *    - `clean_data`: The binary string of clean data.
 *    - `checksum`: The binary string of checksum data.
 *
 * @example
 * // returns { clean_data: '1001', checksum: '1' }
 * separateIntoCleanDataAndChecksum('10011');
 *
 * @note The function relies on external arrays `arrOffsets160` and `arrOffsets288` 
 * for defining the offsets to split the binary string. The offsets correspond to 
 * the positions of the checksum bits in the binary string. It's assumed that the function 
 * is used within the context of data verification in a cryptographic application.
 */
function separateIntoCleanDataAndChecksum(bin) {
   if (typeof bin !== 'string' || !/^[01]+$/.test(bin)) {
      throw Error("Invalid input: bin must be a binary string.");
   }
   var len = bin.length;
   if (len !== 160 && len !== 288) {
      throw Error("Invalid input: bin length must be 160 or 288.");
   }

   var arrOffsets;
   if (len === 160)
      arrOffsets = arrOffsets160;
   else if (len === 288)
      arrOffsets = arrOffsets288;
   else
      throw Error("bad length=" + len + ", bin = " + bin);
   var arrFrags = [];
   var arrChecksumBits = [];
   var start = 0;
   for (var i = 0; i < arrOffsets.length; i++) {
      arrFrags.push(bin.substring(start, arrOffsets[i]));
      arrChecksumBits.push(bin.substr(arrOffsets[i], 1));
      start = arrOffsets[i] + 1;
   }
   // add last frag
   if (start < bin.length)
      arrFrags.push(bin.substring(start));
   var binCleanData = arrFrags.join("");
   var binChecksum = arrChecksumBits.join("");
   return { clean_data: binCleanData, checksum: binChecksum };
}

/**
 * Incorporates checksum bits into clean data based on predefined offsets.
 *
 * @param {string} binCleanData - The binary string of clean data.
 * @param {string} binChecksum - The binary string of checksum data.
 * @throws {Error} Throws an error if the length of the checksum is not 32 or if the total length is not equal to 160 or 288.
 * @returns {string} A binary string where checksum bits have been mixed into the clean data.
 *
 * @example
 * // returns a binary string with checksum mixed into clean data
 * mixChecksumIntoCleanData('1001', '1');
 *
 * @note The function relies on external arrays `arrOffsets160` and `arrOffsets288` 
 * for defining the offsets to incorporate the checksum bits into the clean data. 
 * The offsets correspond to the positions of the checksum bits in the resulting binary string. 
 * It's assumed that the function is used within the context of data verification in a cryptographic application.
 */
function mixChecksumIntoCleanData(binCleanData, binChecksum) {
   if (typeof binCleanData !== 'string' || !/^[01]+$/.test(binCleanData)) {
      throw Error("Invalid input: binCleanData must be a binary string.");
   }
   if (typeof binChecksum !== 'string' || !/^[01]+$/.test(binChecksum)) {
      throw Error("Invalid input: binChecksum must be a binary string.");
   }
   if (binChecksum.length !== 32) {
      throw Error("Invalid input: binChecksum length must be 32.");
   }
   var len = binCleanData.length + binChecksum.length;
   var arrOffsets;
   if (len === 160)
      arrOffsets = arrOffsets160;
   else if (len === 288)
      arrOffsets = arrOffsets288;
   else
      throw Error("bad length=" + len + ", clean data = " + binCleanData + ", checksum = " + binChecksum);
   var arrFrags = [];
   var arrChecksumBits = binChecksum.split("");
   var start = 0;
   for (var i = 0; i < arrOffsets.length; i++) {
      var end = arrOffsets[i] - i;
      arrFrags.push(binCleanData.substring(start, end));
      arrFrags.push(arrChecksumBits[i]);
      start = end;
   }
   // add last frag
   if (start < binCleanData.length)
      arrFrags.push(binCleanData.substring(start));
   return arrFrags.join("");
}

/**
 * Converts a buffer into a binary string.
 *
 * @param {Buffer} buf - The buffer to be converted.
 * @returns {string} The binary string representation of the buffer.
 *
 * @example
 * // returns a binary string representation of the buffer
 * buffer2bin(Buffer.from('Hello World'));
 *
 * @note This function iterates through each byte in the buffer, 
 * converting it to a binary string. It also ensures each binary byte 
 * string is padded with leading zeros to be exactly 8 bits long. 
 */
function buffer2bin(buf) {
   if (!Buffer.isBuffer(buf)) {
      throw Error("Invalid input: buf must be a Buffer.");
   }
   var bytes = [];
   for (var i = 0; i < buf.length; i++) {
      var bin = buf[i].toString(2);
      if (bin.length < 8) // pad with zeros
         bin = zeroString.substring(bin.length, 8) + bin;
      bytes.push(bin);
   }
   return bytes.join("");
}
/**
 * Converts a binary string into a buffer.
 *
 * @param {string} bin - The binary string to be converted.
 * @returns {Buffer} The Buffer representation of the binary string.
 *
 * @example
 * // returns a Buffer representation of the binary string
 * bin2buffer('0100101101001011');
 *
 * @note This function assumes the binary string's length is a multiple of 8. 
 * It splits the binary string into chunks of 8 bits, converts each chunk into a byte, 
 * and inserts the byte into a new buffer. The resulting buffer is then returned.
 */
function bin2buffer(bin) {
   if (typeof bin !== 'string' || !/^[01]+$/.test(bin) || bin.length % 8 !== 0) {
      throw Error("Invalid input: bin must be a binary string with a length that's a multiple of 8.");
   }
   var len = bin.length / 8;
   var buf = new Buffer(len);
   for (var i = 0; i < len; i++)
      buf[i] = parseInt(bin.substr(i * 8, 8), 2);
   return buf;
}
/**
 * Calculates the checksum of the given clean data.
 *
 * @param {Buffer|string} clean_data - The data from which to calculate the checksum. 
 * If a string is provided, it is automatically converted to a Buffer.
 * @returns {Buffer} A 4-byte checksum.
 *
 * @example
 * // returns a Buffer with the checksum of the clean data
 * getChecksum('Hello World');
 *
 * @note The function calculates the SHA-256 hash of the input data and uses the bytes 
 * at positions 5, 13, 21, and 29 from the hash to form the checksum.
 */
function getChecksum(clean_data) {
   if (!(typeof clean_data === 'string' || Buffer.isBuffer(clean_data))) {
      throw Error("Invalid input: clean_data must be a string or a Buffer.");
   }
   var full_checksum = crypto.createHash("sha256").update(clean_data).digest();
   var checksum = new Buffer([full_checksum[5], full_checksum[13], full_checksum[21], full_checksum[29]]);
   return checksum;
}
/**
 * Calculates the c-hash of the given data.
 *
 * @param {string} data - The data from which to calculate the c-hash.
 * @param {number} chash_length - The length of the c-hash. Should be either 160 or 288.
 * @throws {Error} Throws an error if the chash_length is not equal to 160 or 288.
 * @returns {string} The c-hash of the data, encoded in either base32 or base64.
 *
 * @example
 * // returns a string with the encoded c-hash of the data
 * getChash('Hello World', 160);
 *
 * @note The function uses either RIPEMD-160 or SHA-256 to hash the input data, depending on the 
 * specified c-hash length. It then calculates a checksum from the hash, mixes the checksum into 
 * the clean data, and encodes the resulting c-hash in either base32 or base64.
 */
function getChash(data, chash_length) {
   if (typeof data !== 'string') {
      throw Error("Invalid input: data must be a string.");
   }
   if (typeof chash_length !== 'number' || (chash_length !== 160 && chash_length !== 288)) {
      throw Error("Invalid input: chash_length must be either 160 or 288.");
   }
   checkLength(chash_length);
   var hash = crypto.createHash((chash_length === 160) ? "ripemd160" : "sha256").update(data, "utf8").digest();
   var truncated_hash = (chash_length === 160) ? hash.slice(4) : hash; // drop first 4 bytes if 160
   var checksum = getChecksum(truncated_hash);
   var binCleanData = buffer2bin(truncated_hash);
   var binChecksum = buffer2bin(checksum);
   var binChash = mixChecksumIntoCleanData(binCleanData, binChecksum);
   var chash = bin2buffer(binChash);
   var encoded = (chash_length === 160) ? base32.encode(chash).toString() : chash.toString('base64');
   return encoded;
}

function getChash160(data) {
   return getChash(data, 160);
}

/**
 * Validates a given c-hash.
 *
 * @param {string} encoded - The c-hash to validate, encoded in either base32 or base64.
 * @throws {Error} Throws an error if the length of the encoded c-hash is not 32 or 48.
 * @returns {boolean} True if the c-hash is valid, false otherwise.
 *
 * @example
 * // returns true if the c-hash is valid
 * isChashValid('MHQHTEZMNJSG66SP');
 *
 * @note The function checks the length of the encoded c-hash, 
 * then decodes it into a buffer and separates it into clean data and checksum. 
 * It then calculates the expected checksum from the clean data and compares it 
 * to the provided checksum. If they match, the function returns true; 
 * otherwise, it returns false.
 */
function isChashValid(encoded) {
   if (typeof encoded !== 'string') {
      throw Error("Invalid input: encoded must be a string.");
   }
   var encoded_len = encoded.length;
   if (encoded_len !== 32 && encoded_len !== 48) // 160/5 = 32, 288/6 = 48
      throw Error("wrong encoded length: " + encoded_len);
   try {
      var chash = (encoded_len === 32) ? base32.decode(encoded) : new Buffer(encoded, 'base64');
   }
   catch (e) {
      console.log(e);
      return false;
   }
   var binChash = buffer2bin(chash);
   var separated = separateIntoCleanDataAndChecksum(binChash);
   var clean_data = bin2buffer(separated.clean_data);
   var checksum = bin2buffer(separated.checksum);
   return checksum.equals(getChecksum(clean_data));
}

/**
 * Checks the length of a given c-hash.
 *
 * @param {number} chash_length - The length of the c-hash to check.
 *
 * This function checks if the provided c-hash length is either 160 or 288.
 * These values represent the supported lengths for a c-hash. If the provided 
 * length does not match either of these values, the function will throw an 
 * error indicating that the provided c-hash length is unsupported.
 *
 * @throws {Error} If the provided c-hash length is not supported (i.e., it's 
 * not equal to either 160 or 288), the function will throw an Error with a 
 * message indicating this.
 *
 * @example
 * checkLength(160);  // Doesn't throw any error
 * checkLength(100);  // Throws Error('unsupported c-hash length: 100')
 */
function checkLength(chash_length) {
   if (chash_length !== 160 && chash_length !== 288)
      throw Error("unsupported c-hash length: " + chash_length);
}


module.exports = { getChash, getChash160, getSourceString, isChashValid }



