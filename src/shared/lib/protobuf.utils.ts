/**
 * Vérifie si deux valeurs d'un enum Protobuf sont différentes.
 * Protobuf serialise parfois les enums en string, parfois en number.
 */
export const areProtobufEnumsDifferent = (
  val1: string | number | undefined | null,
  val2: string | number | undefined | null,
  enumObj: Record<string | number, string | number>,
): boolean => {
  if (val1 == null || val2 == null) return false;
  if (val1 === val2) return false;
  if (String(val1) === String(val2)) return false;
  if (String(enumObj[val1]) === String(val2)) return false;
  if (String(enumObj[val2]) === String(val1)) return false;
  return true;
};
