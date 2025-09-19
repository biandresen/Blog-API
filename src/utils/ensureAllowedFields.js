/**
 * Filters an object to include only allowed fields.
 *
 * @param {Object} userUpdateData - Input object (e.g., user-provided fields).
 * @param {string[]} allowedFields - List of allowed keys.
 * @returns {Object} A new object containing only the allowed key-value pairs.
 */

function ensureAllowedFields(userUpdateData, allowedFields) {
  console.log(userUpdateData);
  console.log(allowedFields);
  return Object.fromEntries(Object.entries(userUpdateData).filter(([key]) => allowedFields.includes(key)));
}

export default ensureAllowedFields;
