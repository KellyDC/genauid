'use strict';

const { generate } = require('./generator');
const { slugify } = require('./slug');
const { validate, decodeTimestamp } = require('./validator');
const { CHARSETS, DEFAULTS } = require('./constants');

module.exports = {
  /** Generate a time-based, cryptographically random, sortable ID. */
  generate,
  /** Convert a string into a URL-friendly slug, with optional uniqueness suffix. */
  slugify,
  /** Validate a previously generated ID. */
  validate,
  /** Decode an embedded timestamp from an ID string. */
  decodeTimestamp,
  /** Built-in character sets. */
  CHARSETS,
  /** Default configuration values. */
  DEFAULTS,
};
