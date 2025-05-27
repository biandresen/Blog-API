function ensureAllowedFields(userUpdateData, allowedFields) {
  return Object.fromEntries(Object.entries(userUpdateData).filter(([key]) => allowedFields.includes(key)));
}

export default ensureAllowedFields;
