'use strict';

const { generate } = require('./generator');
const { generateSlug } = require('./slug');
const { validate, decodeTimestamp } = require('./validator');
const { CHARSETS, DEFAULTS } = require('./constants');

module.exports = {
  /** Generate a time-based, cryptographically random, sortable ID. */
  generate,
  /** Generate a human-readable, time-based, sortable slug. */
  generateSlug,
  /** Validate a previously generated ID. */
  validate,
  /** Decode an embedded timestamp from an ID string. */
  decodeTimestamp,
  /** Built-in character sets. */
  CHARSETS,
  /** Default configuration values. */
  DEFAULTS,
};
