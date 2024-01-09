export const validSectionFields = ["uuid", "id", "title", "instructor", "dept", "year", "avg", "pass", "fail", "audit"];
export const validRoomsFields =
    ["fullname", "shortname", "number", "name", "address", "lat", "lon", "seats", "type", "furniture", "href"];
export const whereNumberKeys = ["GT", "LT", "EQ"];
export const whereStringKeys = ["IS"];
export const sectionsNumberTypes = ["year", "avg", "pass", "fail", "audit"];
export const sectionsStringTypes = ["uuid", "id", "title", "instructor", "dept"];
export const roomsNumberTypes = ["lat", "lon", "seats"];
export const roomsStringTypes = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
export const validOptionsKeys = ["COLUMNS", "ORDER"];
export const necessaryOrderKeys = ["dir", "keys"];
export const necessaryTransformationsKeys = ["GROUP", "APPLY"];
export const logicKeys = ["AND", "OR", "NOT"];
export const applyTokens = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
